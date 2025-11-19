import { Server as SocketIOServer } from 'socket.io'
import { FastifyInstance } from 'fastify'
import { logger } from '../utils/logger'

export class WebSocketService {
  private io?: SocketIOServer

  init(fastify: FastifyInstance) {
    // @ts-ignore - fastify-socket.io adiciona io ao fastify
    this.io = fastify.io

    this.io?.on('connection', (socket) => {
      logger.info(`📡 Cliente conectado: ${socket.id}`)

      // Quando cliente se autentica e informa seu establishmentId
      socket.on('authenticate', (establishmentId: string) => {
        socket.join(`establishment:${establishmentId}`)
        logger.info(`🔐 Cliente ${socket.id} autenticado no establishment ${establishmentId}`)
      })

      socket.on('disconnect', () => {
        logger.info(`📡 Cliente desconectado: ${socket.id}`)
      })
    })
  }

  /**
   * Emitir evento de nova venda
   */
  emitNewSale(establishmentId: string, sale: any) {
    this.io?.to(`establishment:${establishmentId}`).emit('sale:new', sale)
  }

  /**
   * Emitir evento de venda cancelada
   */
  emitSaleCanceled(establishmentId: string, saleId: string) {
    this.io?.to(`establishment:${establishmentId}`).emit('sale:canceled', { saleId })
  }

  /**
   * Emitir evento de produto atualizado
   */
  emitProductUpdated(establishmentId: string, product: any) {
    this.io?.to(`establishment:${establishmentId}`).emit('product:updated', product)
  }

  /**
   * Emitir evento de produto criado
   */
  emitProductCreated(establishmentId: string, product: any) {
    this.io?.to(`establishment:${establishmentId}`).emit('product:created', product)
  }

  /**
   * Emitir evento de NF-e importada
   */
  emitNfeImported(establishmentId: string, nfeData: any) {
    this.io?.to(`establishment:${establishmentId}`).emit('nfe:imported', nfeData)
  }

  /**
   * Emitir evento de estoque baixo
   */
  emitLowStock(establishmentId: string, products: any[]) {
    this.io?.to(`establishment:${establishmentId}`).emit('stock:low', products)
  }

  /**
   * Emitir status de sincronização
   */
  emitSyncStatus(establishmentId: string, status: 'syncing' | 'synced' | 'error', message?: string) {
    this.io?.to(`establishment:${establishmentId}`).emit('sync:status', { status, message })
  }

  /**
   * Emitir evento de caixa aberto
   */
  emitCaixaOpened(establishmentId: string, caixa: any) {
    this.io?.to(`establishment:${establishmentId}`).emit('caixa:opened', caixa)
  }

  /**
   * Emitir evento de caixa fechado
   */
  emitCaixaClosed(establishmentId: string, caixa: any) {
    this.io?.to(`establishment:${establishmentId}`).emit('caixa:closed', caixa)
  }

  /**
   * Emitir evento de sangria
   */
  emitSangria(establishmentId: string, movimentacao: any) {
    this.io?.to(`establishment:${establishmentId}`).emit('caixa:sangria', movimentacao)
  }

  /**
   * Emitir evento de reforço
   */
  emitReforco(establishmentId: string, movimentacao: any) {
    this.io?.to(`establishment:${establishmentId}`).emit('caixa:reforco', movimentacao)
  }

  /**
   * Emitir evento de produto deletado
   */
  emitProductDeleted(establishmentId: string, productId: string) {
    this.io?.to(`establishment:${establishmentId}`).emit('product:deleted', { productId })
  }
}

export const websocketService = new WebSocketService()
