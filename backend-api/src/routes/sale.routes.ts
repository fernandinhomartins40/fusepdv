import { FastifyInstance } from 'fastify'
import { saleController } from '../controllers/sale.controller'
import { createSaleSchema } from '../types/sale.types'
import { authenticate } from '../middlewares/auth.middleware'

export async function saleRoutes(fastify: FastifyInstance) {
  // Todas as rotas requerem autenticação
  fastify.addHook('preHandler', authenticate)

  // Criar venda
  fastify.post('/', {
    schema: {
      body: createSaleSchema,
    },
    handler: saleController.create.bind(saleController),
  })

  // Listar vendas
  fastify.get('/', {
    handler: saleController.list.bind(saleController),
  })

  // Buscar venda por ID
  fastify.get('/:id', {
    handler: saleController.getById.bind(saleController),
  })

  // Cancelar venda
  fastify.post('/:id/cancel', {
    handler: saleController.cancel.bind(saleController),
  })

  // Relatório de vendas
  fastify.get('/report/summary', {
    handler: saleController.getReport.bind(saleController),
  })

  // Vendas do dia
  fastify.get('/today/list', {
    handler: saleController.getTodaySales.bind(saleController),
  })
}
