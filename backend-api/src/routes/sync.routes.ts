import { FastifyInstance } from 'fastify'
import { syncController } from '../controllers/sync.controller'
import { syncProductsSchema, syncSalesSchema } from '../types/sync.types'
import { authenticate } from '../middlewares/auth.middleware'

export async function syncRoutes(fastify: FastifyInstance) {
  // Todas as rotas requerem autenticação
  fastify.addHook('preHandler', authenticate)

  // Push: PDV envia produtos para servidor
  fastify.post('/products', {
    schema: {
      body: syncProductsSchema,
    },
    handler: syncController.syncProducts.bind(syncController),
  })

  // Push: PDV envia vendas para servidor
  fastify.post('/sales', {
    schema: {
      body: syncSalesSchema,
    },
    handler: syncController.syncSales.bind(syncController),
  })

  // Pull: PDV busca produtos atualizados do servidor
  fastify.get('/products', {
    handler: syncController.pullProducts.bind(syncController),
  })

  // Pull: PDV busca vendas atualizadas do servidor
  fastify.get('/sales', {
    handler: syncController.pullSales.bind(syncController),
  })

  // Status de sincronização
  fastify.get('/status', {
    handler: syncController.getStatus.bind(syncController),
  })
}
