import bcrypt from 'bcrypt'
import { prisma } from '../database/prisma'
import type { UpdateEstablishmentInput, CreateUserInput, UpdateUserInput } from '../types/establishment.types'

const SALT_ROUNDS = 10

export class EstablishmentService {
  /**
   * Buscar estabelecimento por ID
   */
  async findById(id: string) {
    const establishment = await prisma.establishment.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            products: true,
            sales: true,
          },
        },
      },
    })

    if (!establishment) {
      throw new Error('Estabelecimento não encontrado')
    }

    return establishment
  }

  /**
   * Atualizar estabelecimento
   */
  async update(id: string, data: UpdateEstablishmentInput) {
    const establishment = await prisma.establishment.update({
      where: { id },
      data,
    })

    return establishment
  }

  /**
   * Listar usuários do estabelecimento
   */
  async getUsers(establishmentId: string) {
    return await prisma.user.findMany({
      where: { establishmentId },
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        ativo: true,
        createdAt: true,
      },
      orderBy: { nome: 'asc' },
    })
  }

  /**
   * Criar usuário no estabelecimento
   */
  async createUser(establishmentId: string, data: CreateUserInput) {
    // Verificar se email já existe
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (existing) {
      throw new Error('Email já cadastrado')
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(data.senha, SALT_ROUNDS)

    const user = await prisma.user.create({
      data: {
        establishmentId,
        nome: data.nome,
        email: data.email,
        senha: hashedPassword,
        role: data.role,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        ativo: true,
        createdAt: true,
      },
    })

    return user
  }

  /**
   * Atualizar usuário
   */
  async updateUser(userId: string, establishmentId: string, data: UpdateUserInput) {
    // Verificar se usuário pertence ao estabelecimento
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        establishmentId,
      },
    })

    if (!user) {
      throw new Error('Usuário não encontrado')
    }

    // Verificar email duplicado (se alterado)
    if (data.email && data.email !== user.email) {
      const existing = await prisma.user.findUnique({
        where: { email: data.email },
      })

      if (existing) {
        throw new Error('Email já cadastrado')
      }
    }

    // Hash da senha se fornecida
    const updateData: any = { ...data }
    if (data.senha) {
      updateData.senha = await bcrypt.hash(data.senha, SALT_ROUNDS)
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        ativo: true,
        updatedAt: true,
      },
    })

    return updated
  }

  /**
   * Desativar usuário
   */
  async deactivateUser(userId: string, establishmentId: string) {
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        establishmentId,
      },
    })

    if (!user) {
      throw new Error('Usuário não encontrado')
    }

    return await prisma.user.update({
      where: { id: userId },
      data: { ativo: false },
    })
  }

  /**
   * Estatísticas do estabelecimento
   */
  async getStats(establishmentId: string) {
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)

    const [
      totalProdutos,
      totalVendas,
      vendasHoje,
      produtosEstoqueBaixo,
      totalUsuarios,
    ] = await Promise.all([
      prisma.product.count({
        where: { establishmentId, ativo: true },
      }),
      prisma.sale.count({
        where: { establishmentId, status: 'CONCLUIDA' },
      }),
      prisma.sale.count({
        where: {
          establishmentId,
          status: 'CONCLUIDA',
          data: { gte: hoje },
        },
      }),
      prisma.product.count({
        where: {
          establishmentId,
          ativo: true,
          estoqueMinimo: { not: null },
          estoque: {
            lte: prisma.product.fields.estoqueMinimo,
          },
        },
      }),
      prisma.user.count({
        where: { establishmentId, ativo: true },
      }),
    ])

    // Valor total de vendas hoje
    const vendasHojeData = await prisma.sale.aggregate({
      where: {
        establishmentId,
        status: 'CONCLUIDA',
        data: { gte: hoje },
      },
      _sum: {
        total: true,
      },
    })

    return {
      totalProdutos,
      totalVendas,
      vendasHoje: {
        quantidade: vendasHoje,
        valor: Number(vendasHojeData._sum.total || 0),
      },
      produtosEstoqueBaixo,
      totalUsuarios,
    }
  }
}

export const establishmentService = new EstablishmentService()
