import { FastifyInstance } from 'fastify'
import { caixaController } from '../controllers/caixa.controller'
import { authMiddleware } from '../middlewares/auth.middleware'

export async function caixaRoutes(app: FastifyInstance) {
  // Aplicar autenticação em todas as rotas
  app.addHook('onRequest', authMiddleware)

  // POST /caixa/abrir - Abrir caixa
  app.post('/abrir', caixaController.abrirCaixa)

  // POST /caixa/fechar - Fechar caixa
  app.post('/fechar', caixaController.fecharCaixa)

  // POST /caixa/sangria - Registrar sangria
  app.post('/sangria', caixaController.registrarSangria)

  // POST /caixa/reforco - Registrar reforço
  app.post('/reforco', caixaController.registrarReforco)

  // GET /caixa/atual - Consultar caixa atual
  app.get('/atual', caixaController.getCaixaAtual)

  // GET /caixa/movimentacoes - Listar movimentações do caixa
  app.get('/movimentacoes', caixaController.getMovimentacoes)
}
