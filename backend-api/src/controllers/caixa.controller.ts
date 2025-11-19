import { FastifyRequest, FastifyReply } from 'fastify'
// Request types module declaration is loaded globally from server.ts
import { caixaService } from '../services/caixa.service'
import { z } from 'zod'

const abrirCaixaSchema = z.object({
  valorInicial: z.number().min(0),
})

const fecharCaixaSchema = z.object({
  valorFinal: z.number().min(0),
  observacoes: z.string().optional(),
})

const movimentacaoSchema = z.object({
  valor: z.number().positive(),
  observacoes: z.string().optional(),
})

interface GetMovimentacoesQuery {
  page?: string
  limit?: string
}

class CaixaController {
  /**
   * POST /caixa/abrir
   */
  async abrirCaixa(req: FastifyRequest, reply: FastifyReply) {
    try {
      if (!req.user) {
        return reply.status(401).send({
          success: false,
          message: 'Não autorizado',
        })
      }

      const body = abrirCaixaSchema.parse(req.body)

      const caixa = await caixaService.abrirCaixa(
        req.user.establishmentId,
        req.user.userId,
        body.valorInicial
      )

      return reply.status(201).send({
        success: true,
        caixa,
      })
    } catch (error) {
      if (error instanceof Error) {
        return reply.status(400).send({
          success: false,
          message: error.message,
        })
      }
      return reply.status(500).send({
        success: false,
        message: 'Erro interno do servidor',
      })
    }
  }

  /**
   * POST /caixa/fechar
   */
  async fecharCaixa(req: FastifyRequest, reply: FastifyReply) {
    try {
      if (!req.user) {
        return reply.status(401).send({
          success: false,
          message: 'Não autorizado',
        })
      }

      const body = fecharCaixaSchema.parse(req.body)

      const caixa = await caixaService.fecharCaixa(
        req.user.establishmentId,
        req.user.userId,
        body.valorFinal,
        body.observacoes
      )

      return reply.send({
        success: true,
        caixa,
      })
    } catch (error) {
      if (error instanceof Error) {
        return reply.status(400).send({
          success: false,
          message: error.message,
        })
      }
      return reply.status(500).send({
        success: false,
        message: 'Erro interno do servidor',
      })
    }
  }

  /**
   * POST /caixa/sangria
   */
  async registrarSangria(req: FastifyRequest, reply: FastifyReply) {
    try {
      if (!req.user) {
        return reply.status(401).send({
          success: false,
          message: 'Não autorizado',
        })
      }

      const body = movimentacaoSchema.parse(req.body)

      const movimentacao = await caixaService.registrarSangria(
        req.user.establishmentId,
        req.user.userId,
        body.valor,
        body.observacoes
      )

      return reply.status(201).send({
        success: true,
        movimentacao,
      })
    } catch (error) {
      if (error instanceof Error) {
        return reply.status(400).send({
          success: false,
          message: error.message,
        })
      }
      return reply.status(500).send({
        success: false,
        message: 'Erro interno do servidor',
      })
    }
  }

  /**
   * POST /caixa/reforco
   */
  async registrarReforco(req: FastifyRequest, reply: FastifyReply) {
    try {
      if (!req.user) {
        return reply.status(401).send({
          success: false,
          message: 'Não autorizado',
        })
      }

      const body = movimentacaoSchema.parse(req.body)

      const movimentacao = await caixaService.registrarReforco(
        req.user.establishmentId,
        req.user.userId,
        body.valor,
        body.observacoes
      )

      return reply.status(201).send({
        success: true,
        movimentacao,
      })
    } catch (error) {
      if (error instanceof Error) {
        return reply.status(400).send({
          success: false,
          message: error.message,
        })
      }
      return reply.status(500).send({
        success: false,
        message: 'Erro interno do servidor',
      })
    }
  }

  /**
   * GET /caixa/atual
   */
  async getCaixaAtual(req: FastifyRequest, reply: FastifyReply) {
    try {
      if (!req.user) {
        return reply.status(401).send({
          success: false,
          message: 'Não autorizado',
        })
      }

      const caixa = await caixaService.getCaixaAtual(req.user.establishmentId)

      if (!caixa) {
        return reply.status(404).send({
          success: false,
          message: 'Nenhum caixa aberto',
        })
      }

      return reply.send({
        success: true,
        caixa,
      })
    } catch (error) {
      if (error instanceof Error) {
        return reply.status(400).send({
          success: false,
          message: error.message,
        })
      }
      return reply.status(500).send({
        success: false,
        message: 'Erro interno do servidor',
      })
    }
  }

  /**
   * GET /caixa/movimentacoes
   */
  async getMovimentacoes(
    req: FastifyRequest<{ Querystring: GetMovimentacoesQuery }>,
    reply: FastifyReply
  ) {
    try {
      if (!req.user) {
        return reply.status(401).send({
          success: false,
          message: 'Não autorizado',
        })
      }

      const page = parseInt(req.query.page || '1') || 1
      const limit = parseInt(req.query.limit || '20') || 20

      const result = await caixaService.getMovimentacoes(
        req.user.establishmentId,
        page,
        limit
      )

      return reply.send({
        success: true,
        ...result,
      })
    } catch (error) {
      if (error instanceof Error) {
        return reply.status(400).send({
          success: false,
          message: error.message,
        })
      }
      return reply.status(500).send({
        success: false,
        message: 'Erro interno do servidor',
      })
    }
  }
}

export const caixaController = new CaixaController()
