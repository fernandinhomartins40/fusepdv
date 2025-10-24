import { prisma } from '../database/prisma'
import { websocketService } from './websocket.service'
import type { SyncProductsInput, SyncSalesInput } from '../types/sync.types'

export class SyncService {
  /**
   * Sincronizar produtos do PDV para o servidor
   */
  async syncProducts(establishmentId: string, data: SyncProductsInput) {
    let synced = 0
    let errors = 0
    const conflicts = []

    websocketService.emitSyncStatus(establishmentId, 'syncing', 'Sincronizando produtos...')

    for (const product of data.products) {
      try {
        // Verificar se produto já existe no servidor
        const existing = await prisma.product.findUnique({
          where: {
            establishmentId_codigo: {
              establishmentId,
              codigo: product.codigo,
            },
          },
        })

        if (existing) {
          // Verificar conflito (last-write-wins)
          const existingUpdatedAt = new Date(existing.updatedAt)
          const incomingUpdatedAt = new Date(product.updatedAt)

          if (existingUpdatedAt > incomingUpdatedAt) {
            // Servidor está mais atualizado, registrar conflito
            conflicts.push({
              codigo: product.codigo,
              reason: 'Server version is newer',
              serverUpdatedAt: existingUpdatedAt,
              clientUpdatedAt: incomingUpdatedAt,
            })
            continue
          }

          // Atualizar produto no servidor
          await prisma.product.update({
            where: { id: existing.id },
            data: {
              nome: product.nome,
              descricao: product.descricao,
              categoria: product.categoria,
              unidade: product.unidade,
              precoCusto: product.precoCusto,
              precoVenda: product.precoVenda,
              estoque: product.estoque,
              estoqueMinimo: product.estoqueMinimo,
              ncm: product.ncm,
              cest: product.cest,
              cfop: product.cfop,
              ativo: product.ativo,
            },
          })
        } else {
          // Criar novo produto no servidor
          await prisma.product.create({
            data: {
              ...product,
              establishmentId,
            },
          })
        }

        synced++
        websocketService.emitProductUpdated(establishmentId, product)
      } catch (error) {
        errors++
        console.error(`Erro ao sincronizar produto ${product.codigo}:`, error)
      }
    }

    websocketService.emitSyncStatus(establishmentId, 'synced', `${synced} produtos sincronizados`)

    return {
      success: errors === 0,
      synced,
      errors,
      conflicts: conflicts.length > 0 ? conflicts : undefined,
    }
  }

  /**
   * Sincronizar vendas do PDV para o servidor
   */
  async syncSales(establishmentId: string, userId: string, data: SyncSalesInput) {
    let synced = 0
    let errors = 0

    websocketService.emitSyncStatus(establishmentId, 'syncing', 'Sincronizando vendas...')

    for (const sale of data.sales) {
      try {
        // Verificar se venda já existe (por número)
        const existing = await prisma.sale.findUnique({
          where: {
            establishmentId_numero: {
              establishmentId,
              numero: sale.numero,
            },
          },
        })

        if (existing) {
          // Venda já sincronizada, pular
          continue
        }

        // Criar venda no servidor
        const newSale = await prisma.sale.create({
          data: {
            establishmentId,
            userId,
            numero: sale.numero,
            data: new Date(sale.data),
            subtotal: sale.subtotal,
            desconto: sale.desconto,
            total: sale.total,
            formaPagamento: sale.formaPagamento,
            observacoes: sale.observacoes,
            status: 'CONCLUIDA',
            sincronizado: true,
            items: {
              create: sale.items.map((item) => ({
                productId: item.productId,
                quantidade: item.quantidade,
                precoUnitario: item.precoUnitario,
                subtotal: item.subtotal,
                desconto: item.desconto,
              })),
            },
          },
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        })

        synced++
        websocketService.emitNewSale(establishmentId, newSale)
      } catch (error) {
        errors++
        console.error(`Erro ao sincronizar venda #${sale.numero}:`, error)
      }
    }

    websocketService.emitSyncStatus(establishmentId, 'synced', `${synced} vendas sincronizadas`)

    return {
      success: errors === 0,
      synced,
      errors,
    }
  }

  /**
   * Buscar produtos alterados após determinada data (para pull do PDV)
   */
  async getProductsUpdatedSince(establishmentId: string, since: Date) {
    return await prisma.product.findMany({
      where: {
        establishmentId,
        updatedAt: {
          gt: since,
        },
      },
      orderBy: {
        updatedAt: 'asc',
      },
    })
  }

  /**
   * Buscar vendas após determinada data (para pull do PDV)
   */
  async getSalesUpdatedSince(establishmentId: string, since: Date) {
    return await prisma.sale.findMany({
      where: {
        establishmentId,
        updatedAt: {
          gt: since,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'asc',
      },
    })
  }

  /**
   * Status de sincronização
   */
  async getSyncStatus(establishmentId: string) {
    const [lastProductUpdate, lastSaleUpdate, pendingSales] = await Promise.all([
      prisma.product.findFirst({
        where: { establishmentId },
        orderBy: { updatedAt: 'desc' },
        select: { updatedAt: true },
      }),
      prisma.sale.findFirst({
        where: { establishmentId },
        orderBy: { updatedAt: 'desc' },
        select: { updatedAt: true },
      }),
      prisma.sale.count({
        where: {
          establishmentId,
          sincronizado: false,
        },
      }),
    ])

    return {
      lastProductUpdate: lastProductUpdate?.updatedAt,
      lastSaleUpdate: lastSaleUpdate?.updatedAt,
      pendingSales,
    }
  }
}

export const syncService = new SyncService()
