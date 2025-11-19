import { prisma } from '../database/prisma'
import type { CreateSaleInput, SalesReportQuery } from '../types/sale.types'
import { Prisma } from '@prisma/client'
import { websocketService } from './websocket.service'

export class SaleService {
  /**
   * Criar nova venda
   */
  async create(establishmentId: string, userId: string, data: CreateSaleInput) {
    // Calcular totais
    let subtotal = 0
    const itemsData = []

    for (const item of data.items) {
      // Verificar se produto existe e tem estoque
      const product = await prisma.product.findFirst({
        where: {
          id: item.productId,
          establishmentId,
          ativo: true,
        },
      })

      if (!product) {
        throw new Error(`Produto ${item.productId} não encontrado`)
      }

      if (Number(product.estoque) < item.quantidade) {
        throw new Error(`Estoque insuficiente para o produto ${product.nome}`)
      }

      const itemSubtotal = item.quantidade * item.precoUnitario
      const itemDesconto = item.desconto || 0
      subtotal += itemSubtotal

      itemsData.push({
        productId: item.productId,
        quantidade: item.quantidade,
        precoUnitario: item.precoUnitario,
        subtotal: itemSubtotal,
        desconto: itemDesconto,
      })
    }

    const desconto = data.desconto || 0
    const total = subtotal - desconto

    if (total < 0) {
      throw new Error('Total da venda não pode ser negativo')
    }

    // Obter próximo número de venda
    const lastSale = await prisma.sale.findFirst({
      where: { establishmentId },
      orderBy: { numero: 'desc' },
      select: { numero: true },
    })

    const numero = (lastSale?.numero || 0) + 1

    // Criar venda em transação
    const sale = await prisma.$transaction(async (tx) => {
      // Criar venda
      const newSale = await tx.sale.create({
        data: {
          establishmentId,
          userId,
          numero,
          subtotal,
          desconto,
          total,
          formaPagamento: data.formaPagamento,
          observacoes: data.observacoes,
          status: 'CONCLUIDA',
          items: {
            create: itemsData,
          },
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  codigo: true,
                  nome: true,
                  unidade: true,
                },
              },
            },
          },
          user: {
            select: {
              id: true,
              nome: true,
            },
          },
        },
      })

      // Atualizar estoque dos produtos
      for (const item of data.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            estoque: {
              decrement: item.quantidade,
            },
          },
        })
      }

      return newSale
    })

    websocketService.emitNewSale(establishmentId, sale)

    return sale
  }

  /**
   * Listar vendas com filtros
   */
  async findAll(
    establishmentId: string,
    page: number = 1,
    limit: number = 50,
    filters: {
      startDate?: Date
      endDate?: Date
      status?: string
      userId?: string
    } = {}
  ) {
    const where: Prisma.SaleWhereInput = {
      establishmentId,
    }

    if (filters.startDate || filters.endDate) {
      where.data = {}
      if (filters.startDate) {
        where.data.gte = filters.startDate
      }
      if (filters.endDate) {
        where.data.lte = filters.endDate
      }
    }

    if (filters.status) {
      where.status = filters.status as any
    }

    if (filters.userId) {
      where.userId = filters.userId
    }

    const [sales, total] = await Promise.all([
      prisma.sale.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { data: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              nome: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  codigo: true,
                  nome: true,
                  unidade: true,
                },
              },
            },
          },
        },
      }),
      prisma.sale.count({ where }),
    ])

    return {
      sales,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  }

  /**
   * Buscar venda por ID
   */
  async findById(id: string, establishmentId: string) {
    const sale = await prisma.sale.findFirst({
      where: {
        id,
        establishmentId,
      },
      include: {
        user: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                codigo: true,
                ean: true,
                nome: true,
                unidade: true,
              },
            },
          },
        },
      },
    })

    if (!sale) {
      throw new Error('Venda não encontrada')
    }

    return sale
  }

  /**
   * Cancelar venda
   */
  async cancel(id: string, establishmentId: string) {
    const sale = await this.findById(id, establishmentId)

    if (sale.status === 'CANCELADA') {
      throw new Error('Venda já está cancelada')
    }

    // Cancelar venda e reverter estoque em transação
    const canceledSale = await prisma.$transaction(async (tx) => {
      // Atualizar status
      const updated = await tx.sale.update({
        where: { id },
        data: { status: 'CANCELADA' },
        include: {
          items: true,
          user: {
            select: {
              id: true,
              nome: true,
            },
          },
        },
      })

      // Reverter estoque
      for (const item of sale.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            estoque: {
              increment: Number(item.quantidade),
            },
          },
        })
      }

      return updated
    })

    websocketService.emitSaleCanceled(establishmentId, id)

    return canceledSale
  }

  /**
   * Relatório de vendas
   */
  async getReport(establishmentId: string, filters: SalesReportQuery = {}) {
    const where: Prisma.SaleWhereInput = {
      establishmentId,
      status: 'CONCLUIDA',
    }

    if (filters.startDate || filters.endDate) {
      where.data = {}
      if (filters.startDate) {
        where.data.gte = new Date(filters.startDate)
      }
      if (filters.endDate) {
        where.data.lte = new Date(filters.endDate)
      }
    }

    if (filters.formaPagamento) {
      where.formaPagamento = filters.formaPagamento
    }

    if (filters.userId) {
      where.userId = filters.userId
    }

    // Buscar vendas
    const sales = await prisma.sale.findMany({
      where,
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                nome: true,
              },
            },
          },
        },
      },
    })

    // Calcular métricas
    const totalVendas = sales.length
    const valorTotal = sales.reduce((sum, sale) => sum + Number(sale.total), 0)
    const ticketMedio = totalVendas > 0 ? valorTotal / totalVendas : 0

    // Vendas por dia
    const vendasPorDiaMap = new Map<string, { quantidade: number; valor: number }>()
    sales.forEach((sale) => {
      const dia = sale.data.toISOString().split('T')[0]
      const current = vendasPorDiaMap.get(dia) || { quantidade: 0, valor: 0 }
      vendasPorDiaMap.set(dia, {
        quantidade: current.quantidade + 1,
        valor: current.valor + Number(sale.total),
      })
    })

    const vendasPorDia = Array.from(vendasPorDiaMap.entries()).map(([data, stats]) => ({
      data,
      ...stats,
    }))

    // Vendas por forma de pagamento
    const vendasPorPagamentoMap = new Map<string, { quantidade: number; valor: number }>()
    sales.forEach((sale) => {
      const current = vendasPorPagamentoMap.get(sale.formaPagamento) || { quantidade: 0, valor: 0 }
      vendasPorPagamentoMap.set(sale.formaPagamento, {
        quantidade: current.quantidade + 1,
        valor: current.valor + Number(sale.total),
      })
    })

    const vendasPorFormaPagamento = Array.from(vendasPorPagamentoMap.entries()).map(
      ([formaPagamento, stats]) => ({
        formaPagamento,
        ...stats,
      })
    )

    // Produtos mais vendidos
    const produtosMap = new Map<string, { nome: string; quantidade: number; valor: number }>()
    sales.forEach((sale) => {
      sale.items.forEach((item) => {
        const current = produtosMap.get(item.productId) || {
          nome: item.product.nome,
          quantidade: 0,
          valor: 0,
        }
        produtosMap.set(item.productId, {
          nome: item.product.nome,
          quantidade: current.quantidade + Number(item.quantidade),
          valor: current.valor + Number(item.subtotal),
        })
      })
    })

    const produtosMaisVendidos = Array.from(produtosMap.entries())
      .map(([productId, stats]) => ({
        productId,
        ...stats,
      }))
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 10)

    return {
      totalVendas,
      valorTotal,
      ticketMedio,
      vendasPorDia,
      vendasPorFormaPagamento,
      produtosMaisVendidos,
    }
  }

  /**
   * Buscar vendas do dia
   */
  async getTodaySales(establishmentId: string) {
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)

    const amanha = new Date(hoje)
    amanha.setDate(amanha.getDate() + 1)

    return await prisma.sale.findMany({
      where: {
        establishmentId,
        data: {
          gte: hoje,
          lt: amanha,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
      orderBy: { data: 'desc' },
    })
  }
}

export const saleService = new SaleService()
