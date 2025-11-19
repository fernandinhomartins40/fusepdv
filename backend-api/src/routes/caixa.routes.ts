import { FastifyInstance } from 'fastify'
import { caixaController } from '../controllers/caixa.controller'
import { authenticate } from '../middlewares/auth.middleware'
import {
  abrirCaixaSchema,
  fecharCaixaSchema,
  sangriaSchema,
  reforcoSchema,
  movimentacoesQuerySchema,
} from '../types/caixa.types'

export async function caixaRoutes(app: FastifyInstance) {
  // Aplicar autenticação em todas as rotas
  app.addHook('onRequest', authenticate)

  // POST /caixa/abrir - Abrir caixa
  app.post('/abrir', {
    schema: {
      body: abrirCaixaSchema,
    },
    handler: caixaController.abrirCaixa,
  })

  // POST /caixa/fechar - Fechar caixa
  app.post('/fechar', {
    schema: {
      body: fecharCaixaSchema,
    },
    handler: caixaController.fecharCaixa,
  })

  // POST /caixa/sangria - Registrar sangria
  app.post('/sangria', {
    schema: {
      body: sangriaSchema,
    },
    handler: caixaController.registrarSangria,
  })

  // POST /caixa/reforco - Registrar reforço
  app.post('/reforco', {
    schema: {
      body: reforcoSchema,
    },
    handler: caixaController.registrarReforco,
  })

  // GET /caixa/atual - Consultar caixa atual
  app.get('/atual', caixaController.getCaixaAtual)

  // GET /caixa/movimentacoes - Listar movimentações do caixa
  app.get('/movimentacoes', {
    schema: {
      querystring: movimentacoesQuerySchema,
    },
    handler: caixaController.getMovimentacoes,
  })
}
