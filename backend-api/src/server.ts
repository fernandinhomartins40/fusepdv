import 'dotenv/config'
// Import request types to ensure FastifyRequest is properly extended globally
import './types/request.types'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import multipart from '@fastify/multipart'
import rateLimit from '@fastify/rate-limit'
import swagger from '@fastify/swagger'
import swaggerUI from '@fastify/swagger-ui'
import { authRoutes } from './routes/auth.routes'
import { productRoutes } from './routes/product.routes'
import { nfeRoutes } from './routes/nfe.routes'
import { saleRoutes} from './routes/sale.routes'
import { establishmentRoutes } from './routes/establishment.routes'
import { syncRoutes } from './routes/sync.routes'
import { caixaRoutes } from './routes/caixa.routes'
import { websocketService } from './services/websocket.service'
import socketio from 'fastify-socket.io'
import { logger } from './utils/logger'
import { errorHandler } from './utils/error-handler'

const fastify = Fastify({
  logger,
  disableRequestLogging: false,
  requestIdHeader: 'x-request-id',
  requestIdLogLabel: 'reqId',
})

// Register error handler
fastify.setErrorHandler(errorHandler)

async function start() {
  try {
    // Registrar plugins
    await fastify.register(cors, {
      origin: process.env.CORS_ORIGIN?.split(',') || true,
      credentials: true,
    })

    await fastify.register(jwt, {
      secret: process.env.JWT_ACCESS_SECRET || 'your-super-secret-access-key-change-in-production',
    })

    await fastify.register(multipart, {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB para arquivos XML
      },
    })

    // Registrar Rate Limiting - Global default (100 requests per minute)
    await fastify.register(rateLimit, {
      max: 100,
      timeWindow: '1 minute',
      cache: 10000, // number of tokens to store per IP
      allowList: [], // Add IPs to bypass rate limiting if needed
      redis: undefined, // Can be used with Redis for distributed systems
      skip: (request) => {
        // Skip rate limiting for health checks
        return request.url === '/health'
      },
    })

    // Registrar WebSocket
    await fastify.register(socketio, {
      cors: {
        origin: process.env.CORS_ORIGIN?.split(',') || '*',
        credentials: true,
      },
    })

    // Registrar Swagger
    await fastify.register(swagger, {
      swagger: {
        info: {
          title: 'PDV Backend API',
          description: 'API para Sistema PDV com importação de NF-e',
          version: '1.0.0',
        },
        host: `${process.env.HOST || 'localhost'}:${process.env.PORT || 3333}`,
        schemes: ['http', 'https'],
        consumes: ['application/json'],
        produces: ['application/json'],
        securityDefinitions: {
          apiKey: {
            type: 'apiKey',
            name: 'authorization',
            in: 'header',
          },
        },
      },
    })

    // Registrar Swagger UI
    await fastify.register(swaggerUI, {
      routePrefix: '/docs',
    })

    // Inicializar WebSocket service
    websocketService.init(fastify)

    // Registrar rotas com Rate Limiting específico para Auth
    // Auth routes - Stricter limit (10 requests per minute)
    await fastify.register(async (fastifyInstance) => {
      await fastifyInstance.register(rateLimit, {
        max: 10,
        timeWindow: '1 minute',
      })
      await fastifyInstance.register(authRoutes)
    }, { prefix: '/auth' })
    await fastify.register(productRoutes, { prefix: '/products' })
    await fastify.register(nfeRoutes, { prefix: '/nfe' })
    await fastify.register(saleRoutes, { prefix: '/sales' })
    await fastify.register(establishmentRoutes, { prefix: '/establishment' })
    await fastify.register(syncRoutes, { prefix: '/sync' })
    await fastify.register(caixaRoutes, { prefix: '/caixa' })

    // Health check
    fastify.get('/health', async () => {
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      }
    })

    // Rota raiz
    fastify.get('/', async () => {
      return {
        name: 'PDV Backend API',
        version: '1.0.0',
        description: 'API para Sistema PDV com importação de NF-e',
      }
    })

    // Iniciar servidor
    const port = parseInt(process.env.PORT || '3333')
    const host = process.env.HOST || '0.0.0.0'

    await fastify.listen({ port, host })

    logger.info({
      msg: 'Server started successfully',
      url: `http://${host}:${port}`,
      env: process.env.NODE_ENV || 'development',
      endpoints: {
        health: '/health',
        auth: '/auth',
        establishment: '/establishment',
        products: '/products',
        nfe: '/nfe',
        sales: '/sales',
        caixa: '/caixa',
        sync: '/sync',
      },
      documentation: {
        swaggerUI: `http://${host}:${port}/docs`,
        swaggerJSON: `http://${host}:${port}/docs/json`,
      },
      websocket: `ws://localhost:${port}`,
    })
  } catch (error) {
    logger.error({ err: error }, 'Failed to start server')
    process.exit(1)
  }
}

// Graceful shutdown
const signals = ['SIGINT', 'SIGTERM']
signals.forEach((signal) => {
  process.on(signal, async () => {
    logger.info(`${signal} received, closing server gracefully...`)
    await fastify.close()
    logger.info('Server closed successfully')
    process.exit(0)
  })
})

start()
