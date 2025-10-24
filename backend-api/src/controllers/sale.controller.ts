import { FastifyRequest, FastifyReply } from 'fastify'
import { saleService } from '../services/sale.service'
import type { CreateSaleInput, SalesReportQuery } from '../types/sale.types'

export class SaleController {
  async create(request: FastifyRequest<{ Body: CreateSaleInput }>, reply: FastifyReply) {
    try {
      const establishmentId = request.user?.establishmentId
      const userId = request.user?.userId

      if (!establishmentId || !userId) {
        return reply.status(401).send({ error: 'Não autorizado' })
      }

      const sale = await saleService.create(establishmentId, userId, request.body)

      return reply.status(201).send(sale)
    } catch (error) {
      if (error instanceof Error) {
        return reply.status(400).send({
          error: 'Erro ao criar venda',
          message: error.message,
        })
      }
      return reply.status(500).send({ error: 'Erro interno do servidor' })
    }
  }

  async list(
    request: FastifyRequest<{
      Querystring: {
        page?: string
        limit?: string
        startDate?: string
        endDate?: string
        status?: string
        userId?: string
      }
    }>,
    reply: FastifyReply
  ) {
    try {
      const establishmentId = request.user?.establishmentId

      if (!establishmentId) {
        return reply.status(401).send({ error: 'Não autorizado' })
      }

      const page = parseInt(request.query.page || '1')
      const limit = parseInt(request.query.limit || '50')

      const filters: any = {}
      if (request.query.startDate) {
        filters.startDate = new Date(request.query.startDate)
      }
      if (request.query.endDate) {
        filters.endDate = new Date(request.query.endDate)
      }
      if (request.query.status) {
        filters.status = request.query.status
      }
      if (request.query.userId) {
        filters.userId = request.query.userId
      }

      const result = await saleService.findAll(establishmentId, page, limit, filters)

      return reply.status(200).send(result)
    } catch (error) {
      return reply.status(500).send({ error: 'Erro ao listar vendas' })
    }
  }

  async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const establishmentId = request.user?.establishmentId

      if (!establishmentId) {
        return reply.status(401).send({ error: 'Não autorizado' })
      }

      const sale = await saleService.findById(request.params.id, establishmentId)

      return reply.status(200).send(sale)
    } catch (error) {
      if (error instanceof Error) {
        return reply.status(404).send({
          error: 'Venda não encontrada',
          message: error.message,
        })
      }
      return reply.status(500).send({ error: 'Erro interno do servidor' })
    }
  }

  async cancel(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const establishmentId = request.user?.establishmentId

      if (!establishmentId) {
        return reply.status(401).send({ error: 'Não autorizado' })
      }

      const sale = await saleService.cancel(request.params.id, establishmentId)

      return reply.status(200).send(sale)
    } catch (error) {
      if (error instanceof Error) {
        return reply.status(400).send({
          error: 'Erro ao cancelar venda',
          message: error.message,
        })
      }
      return reply.status(500).send({ error: 'Erro interno do servidor' })
    }
  }

  async getReport(
    request: FastifyRequest<{ Querystring: SalesReportQuery }>,
    reply: FastifyReply
  ) {
    try {
      const establishmentId = request.user?.establishmentId

      if (!establishmentId) {
        return reply.status(401).send({ error: 'Não autorizado' })
      }

      const report = await saleService.getReport(establishmentId, request.query)

      return reply.status(200).send(report)
    } catch (error) {
      return reply.status(500).send({ error: 'Erro ao gerar relatório' })
    }
  }

  async getTodaySales(request: FastifyRequest, reply: FastifyReply) {
    try {
      const establishmentId = request.user?.establishmentId

      if (!establishmentId) {
        return reply.status(401).send({ error: 'Não autorizado' })
      }

      const sales = await saleService.getTodaySales(establishmentId)

      return reply.status(200).send(sales)
    } catch (error) {
      return reply.status(500).send({ error: 'Erro ao buscar vendas do dia' })
    }
  }
}

export const saleController = new SaleController()
