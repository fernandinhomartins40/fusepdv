import { FastifyRequest, FastifyReply } from 'fastify'
import { syncService } from '../services/sync.service'
import type { SyncProductsInput, SyncSalesInput } from '../types/sync.types'

export class SyncController {
  async syncProducts(request: FastifyRequest<{ Body: SyncProductsInput }>, reply: FastifyReply) {
    try {
      const establishmentId = request.user?.establishmentId

      if (!establishmentId) {
        return reply.status(401).send({ error: 'Não autorizado' })
      }

      const result = await syncService.syncProducts(establishmentId, request.body)

      return reply.status(200).send(result)
    } catch (error) {
      if (error instanceof Error) {
        return reply.status(400).send({
          error: 'Erro ao sincronizar produtos',
          message: error.message,
        })
      }
      return reply.status(500).send({ error: 'Erro interno do servidor' })
    }
  }

  async syncSales(request: FastifyRequest<{ Body: SyncSalesInput }>, reply: FastifyReply) {
    try {
      const establishmentId = request.user?.establishmentId
      const userId = request.user?.userId

      if (!establishmentId || !userId) {
        return reply.status(401).send({ error: 'Não autorizado' })
      }

      const result = await syncService.syncSales(establishmentId, userId, request.body)

      return reply.status(200).send(result)
    } catch (error) {
      if (error instanceof Error) {
        return reply.status(400).send({
          error: 'Erro ao sincronizar vendas',
          message: error.message,
        })
      }
      return reply.status(500).send({ error: 'Erro interno do servidor' })
    }
  }

  async pullProducts(
    request: FastifyRequest<{ Querystring: { since?: string } }>,
    reply: FastifyReply
  ) {
    try {
      const establishmentId = request.user?.establishmentId

      if (!establishmentId) {
        return reply.status(401).send({ error: 'Não autorizado' })
      }

      const since = request.query.since ? new Date(request.query.since) : new Date(0)

      const products = await syncService.getProductsUpdatedSince(establishmentId, since)

      return reply.status(200).send({
        products,
        count: products.length,
        lastSync: new Date(),
      })
    } catch (error) {
      return reply.status(500).send({ error: 'Erro ao buscar produtos' })
    }
  }

  async pullSales(
    request: FastifyRequest<{ Querystring: { since?: string } }>,
    reply: FastifyReply
  ) {
    try {
      const establishmentId = request.user?.establishmentId

      if (!establishmentId) {
        return reply.status(401).send({ error: 'Não autorizado' })
      }

      const since = request.query.since ? new Date(request.query.since) : new Date(0)

      const sales = await syncService.getSalesUpdatedSince(establishmentId, since)

      return reply.status(200).send({
        sales,
        count: sales.length,
        lastSync: new Date(),
      })
    } catch (error) {
      return reply.status(500).send({ error: 'Erro ao buscar vendas' })
    }
  }

  async getStatus(request: FastifyRequest, reply: FastifyReply) {
    try {
      const establishmentId = request.user?.establishmentId

      if (!establishmentId) {
        return reply.status(401).send({ error: 'Não autorizado' })
      }

      const status = await syncService.getSyncStatus(establishmentId)

      return reply.status(200).send(status)
    } catch (error) {
      return reply.status(500).send({ error: 'Erro ao buscar status de sincronização' })
    }
  }
}

export const syncController = new SyncController()
