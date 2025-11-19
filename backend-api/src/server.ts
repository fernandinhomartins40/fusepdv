import 'dotenv/config'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import multipart from '@fastify/multipart'
import { authRoutes } from './routes/auth.routes'
import { productRoutes } from './routes/product.routes'
import { nfeRoutes } from './routes/nfe.routes'
import { saleRoutes} from './routes/sale.routes'
import { establishmentRoutes } from './routes/establishment.routes'
import { syncRoutes } from './routes/sync.routes'
import { caixaRoutes } from './routes/caixa.routes'
import { websocketService } from './services/websocket.service'
import socketio from 'fastify-socket.io'

const fastify = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'development' ? 'info' : 'error',
    transport: process.env.NODE_ENV === 'development' ? {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    } : undefined,
  },
})

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

    // Registrar WebSocket
    await fastify.register(socketio, {
      cors: {
        origin: process.env.CORS_ORIGIN?.split(',') || '*',
        credentials: true,
      },
    })

    // Inicializar WebSocket service
    websocketService.init(fastify)

    // Registrar rotas
    await fastify.register(authRoutes, { prefix: '/auth' })
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

    console.log(`\n🚀 Servidor rodando em http://${host}:${port}`)
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`)
    console.log(`\n📚 Documentação:`)
    console.log(`   - Health: http://localhost:${port}/health`)
    console.log(`   - Auth: http://localhost:${port}/auth`)
    console.log(`   - Establishment: http://localhost:${port}/establishment`)
    console.log(`   - Products: http://localhost:${port}/products`)
    console.log(`   - NF-e: http://localhost:${port}/nfe`)
    console.log(`   - Sales: http://localhost:${port}/sales`)
    console.log(`   - Caixa: http://localhost:${port}/caixa`)
    console.log(`   - Sync: http://localhost:${port}/sync`)
    console.log(`\n📡 WebSocket: ws://localhost:${port}`)
  } catch (error) {
    fastify.log.error(error)
    process.exit(1)
  }
}

// Graceful shutdown
const signals = ['SIGINT', 'SIGTERM']
signals.forEach((signal) => {
  process.on(signal, async () => {
    console.log(`\n${signal} received, closing server...`)
    await fastify.close()
    process.exit(0)
  })
})

start()
