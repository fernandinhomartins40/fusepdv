import { prisma } from '../database/prisma'
import { websocketService } from './websocket.service'

export class CaixaService {
  /**
   * Abre um novo caixa
   */
  async abrirCaixa(
    establishmentId: string,
    userId: string,
    valorInicial: number
  ) {
    // Verificar se já existe um caixa aberto
    const caixaAberto = await this.getCaixaAtual(establishmentId)

    if (caixaAberto) {
      throw new Error('Já existe um caixa aberto. Feche o caixa atual antes de abrir um novo.')
    }

    // Criar novo caixa
    const caixa = await prisma.caixaMovimentacao.create({
      data: {
        establishmentId,
        userId,
        tipo: 'ABERTURA',
        valor: valorInicial,
        saldoAnterior: 0,
        saldoAtual: valorInicial,
        dataHora: new Date(),
        aberto: true,
      },
      include: {
        user: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
    })

    websocketService.emitCaixaOpened(establishmentId, caixa)

    return caixa
  }

  /**
   * Fecha o caixa atual
   */
  async fecharCaixa(
    establishmentId: string,
    userId: string,
    valorFinal: number,
    observacoes?: string
  ) {
    // Buscar caixa aberto
    const caixaAberto = await this.getCaixaAtual(establishmentId)

    if (!caixaAberto) {
      throw new Error('Nenhum caixa aberto encontrado')
    }

    // Calcular diferença
    const diferenca = valorFinal - caixaAberto.saldoAtual

    // Criar movimentação de fechamento
    const fechamento = await prisma.caixaMovimentacao.create({
      data: {
        establishmentId,
        userId,
        tipo: 'FECHAMENTO',
        valor: valorFinal,
        saldoAnterior: caixaAberto.saldoAtual,
        saldoAtual: valorFinal,
        dataHora: new Date(),
        observacoes: observacoes || `Diferença: R$ ${diferenca.toFixed(2)}`,
        aberto: false,
      },
      include: {
        user: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
    })

    // Marcar caixa anterior como fechado
    await prisma.caixaMovimentacao.update({
      where: { id: caixaAberto.id },
      data: { aberto: false },
    })

    const result = {
      ...fechamento,
      diferenca,
      valorEsperado: caixaAberto.saldoAtual,
      valorContado: valorFinal,
    }

    websocketService.emitCaixaClosed(establishmentId, result)

    return result
  }

  /**
   * Registra uma sangria (retirada de dinheiro)
   */
  async registrarSangria(
    establishmentId: string,
    userId: string,
    valor: number,
    observacoes?: string
  ) {
    // Verificar se há caixa aberto
    const caixaAberto = await this.getCaixaAtual(establishmentId)

    if (!caixaAberto) {
      throw new Error('Nenhum caixa aberto. Abra um caixa antes de registrar sangria.')
    }

    // Verificar se há saldo suficiente
    if (caixaAberto.saldoAtual < valor) {
      throw new Error('Saldo insuficiente para sangria')
    }

    // Criar movimentação
    const novoSaldo = caixaAberto.saldoAtual - valor

    const sangria = await prisma.caixaMovimentacao.create({
      data: {
        establishmentId,
        userId,
        tipo: 'SANGRIA',
        valor,
        saldoAnterior: caixaAberto.saldoAtual,
        saldoAtual: novoSaldo,
        dataHora: new Date(),
        observacoes,
        aberto: true,
      },
      include: {
        user: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
    })

    // Atualizar saldo do caixa aberto
    await prisma.caixaMovimentacao.update({
      where: { id: caixaAberto.id },
      data: { saldoAtual: novoSaldo },
    })

    websocketService.emitSangria(establishmentId, sangria)

    return sangria
  }

  /**
   * Registra um reforço (adição de dinheiro)
   */
  async registrarReforco(
    establishmentId: string,
    userId: string,
    valor: number,
    observacoes?: string
  ) {
    // Verificar se há caixa aberto
    const caixaAberto = await this.getCaixaAtual(establishmentId)

    if (!caixaAberto) {
      throw new Error('Nenhum caixa aberto. Abra um caixa antes de registrar reforço.')
    }

    // Criar movimentação
    const novoSaldo = caixaAberto.saldoAtual + valor

    const reforco = await prisma.caixaMovimentacao.create({
      data: {
        establishmentId,
        userId,
        tipo: 'REFORCO',
        valor,
        saldoAnterior: caixaAberto.saldoAtual,
        saldoAtual: novoSaldo,
        dataHora: new Date(),
        observacoes,
        aberto: true,
      },
      include: {
        user: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
    })

    // Atualizar saldo do caixa aberto
    await prisma.caixaMovimentacao.update({
      where: { id: caixaAberto.id },
      data: { saldoAtual: novoSaldo },
    })

    websocketService.emitReforco(establishmentId, reforco)

    return reforco
  }

  /**
   * Busca o caixa atualmente aberto
   */
  async getCaixaAtual(establishmentId: string) {
    const caixa = await prisma.caixaMovimentacao.findFirst({
      where: {
        establishmentId,
        aberto: true,
        tipo: 'ABERTURA',
      },
      include: {
        user: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
      orderBy: {
        dataHora: 'desc',
      },
    })

    return caixa
  }

  /**
   * Lista movimentações do caixa
   */
  async getMovimentacoes(
    establishmentId: string,
    page: number = 1,
    limit: number = 20
  ) {
    const where = {
      establishmentId,
    }

    const [movimentacoes, total] = await Promise.all([
      prisma.caixaMovimentacao.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              nome: true,
              email: true,
            },
          },
        },
        orderBy: {
          dataHora: 'desc',
        },
      }),
      prisma.caixaMovimentacao.count({ where }),
    ])

    return {
      movimentacoes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  }
}

export const caixaService = new CaixaService()
