import { FastifyInstance } from 'fastify'
import { establishmentController } from '../controllers/establishment.controller'
import { updateEstablishmentSchema, createUserSchema, updateUserSchema } from '../types/establishment.types'
import { authenticate, requireAdmin } from '../middlewares/auth.middleware'

export async function establishmentRoutes(fastify: FastifyInstance) {
  // Todas as rotas requerem autenticação
  fastify.addHook('preHandler', authenticate)

  // Buscar estabelecimento
  fastify.get('/', {
    handler: establishmentController.get.bind(establishmentController),
  })

  // Atualizar estabelecimento (apenas admin)
  fastify.patch('/', {
    preHandler: [requireAdmin],
    schema: {
      body: updateEstablishmentSchema,
    },
    handler: establishmentController.update.bind(establishmentController),
  })

  // Estatísticas do estabelecimento
  fastify.get('/stats', {
    handler: establishmentController.getStats.bind(establishmentController),
  })

  // Usuários do estabelecimento
  fastify.get('/users', {
    handler: establishmentController.getUsers.bind(establishmentController),
  })

  // Criar usuário (apenas admin)
  fastify.post('/users', {
    preHandler: [requireAdmin],
    schema: {
      body: createUserSchema,
    },
    handler: establishmentController.createUser.bind(establishmentController),
  })

  // Atualizar usuário (apenas admin)
  fastify.patch('/users/:userId', {
    preHandler: [requireAdmin],
    schema: {
      body: updateUserSchema,
    },
    handler: establishmentController.updateUser.bind(establishmentController),
  })

  // Desativar usuário (apenas admin)
  fastify.delete('/users/:userId', {
    preHandler: [requireAdmin],
    handler: establishmentController.deactivateUser.bind(establishmentController),
  })
}
