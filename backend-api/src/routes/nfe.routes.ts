import { FastifyInstance } from 'fastify'
import { nfeController } from '../controllers/nfe.controller'
import { parseNfeSchema } from '../types/nfe.types'
import { authenticate } from '../middlewares/auth.middleware'

export async function nfeRoutes(fastify: FastifyInstance) {
  // Todas as rotas requerem autenticação
  fastify.addHook('preHandler', authenticate)

  // Parsear XML de NF-e
  fastify.post('/parse', {
    schema: {
      body: parseNfeSchema,
    },
    handler: nfeController.parse.bind(nfeController),
  })

  // Histórico de importações
  fastify.get('/history', {
    handler: nfeController.history.bind(nfeController),
  })

  // Detalhes de uma importação
  fastify.get('/:id', {
    handler: nfeController.getById.bind(nfeController),
  })

  // Download XML original
  fastify.get('/:id/xml', {
    handler: nfeController.downloadXML.bind(nfeController),
  })
}
