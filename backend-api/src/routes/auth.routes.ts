import { FastifyInstance } from 'fastify'
import { authController } from '../controllers/auth.controller'
import { registerSchema, loginSchema, refreshTokenSchema } from '../types/auth.types'
import { authenticate } from '../middlewares/auth.middleware'

export async function authRoutes(fastify: FastifyInstance) {
  // Registro de novo estabelecimento
  fastify.post('/register', {
    schema: {
      body: registerSchema,
      response: {
        201: {
          type: 'object',
          properties: {
            user: { type: 'object' },
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' },
          },
        },
      },
    },
    handler: authController.register.bind(authController),
  })

  // Login
  fastify.post('/login', {
    schema: {
      body: loginSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            user: { type: 'object' },
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' },
          },
        },
      },
    },
    handler: authController.login.bind(authController),
  })

  // Renovar access token
  fastify.post('/refresh', {
    schema: {
      body: refreshTokenSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            accessToken: { type: 'string' },
          },
        },
      },
    },
    handler: authController.refresh.bind(authController),
  })

  // Logout
  fastify.post('/logout', {
    schema: {
      body: refreshTokenSchema,
    },
    handler: authController.logout.bind(authController),
  })

  // Dados do usuário autenticado
  fastify.get('/me', {
    preHandler: [authenticate],
    handler: authController.me.bind(authController),
  })
}
