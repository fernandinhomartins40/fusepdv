import { FastifyRequest, FastifyReply } from 'fastify'
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

class CaixaController {
  /**
   * POST /caixa/abrir
   */
  async abrirCaixa(req: FastifyRequest, reply: FastifyReply) {
    try {
      const user = (req as any).user
      const body = abrirCaixaSchema.parse(req.body)

      const caixa = await caixaService.abrirCaixa(
        user.establishmentId,
        user.userId,
        body.valorInicial
      )

      return reply.status(201).send({
        success: true,
        caixa,
      })
    } catch (error: any) {
      return reply.status(400).send({
        success: false,
        message: error.message,
      })
    }
  }

  /**
   * POST /caixa/fechar
   */
  async fecharCaixa(req: FastifyRequest, reply: FastifyReply) {
    try {
      const user = (req as any).user
      const body = fecharCaixaSchema.parse(req.body)

      const caixa = await caixaService.fecharCaixa(
        user.establishmentId,
        user.userId,
        body.valorFinal,
        body.observacoes
      )

      return reply.send({
        success: true,
        caixa,
      })
    } catch (error: any) {
      return reply.status(400).send({
        success: false,
        message: error.message,
      })
    }
  }

  /**
   * POST /caixa/sangria
   */
  async registrarSangria(req: FastifyRequest, reply: FastifyReply) {
    try {
      const user = (req as any).user
      const body = movimentacaoSchema.parse(req.body)

      const movimentacao = await caixaService.registrarSangria(
        user.establishmentId,
        user.userId,
        body.valor,
        body.observacoes
      )

      return reply.status(201).send({
        success: true,
        movimentacao,
      })
    } catch (error: any) {
      return reply.status(400).send({
        success: false,
        message: error.message,
      })
    }
  }

  /**
   * POST /caixa/reforco
   */
  async registrarReforco(req: FastifyRequest, reply: FastifyReply) {
    try {
      const user = (req as any).user
      const body = movimentacaoSchema.parse(req.body)

      const movimentacao = await caixaService.registrarReforco(
        user.establishmentId,
        user.userId,
        body.valor,
        body.observacoes
      )

      return reply.status(201).send({
        success: true,
        movimentacao,
      })
    } catch (error: any) {
      return reply.status(400).send({
        success: false,
        message: error.message,
      })
    }
  }

  /**
   * GET /caixa/atual
   */
  async getCaixaAtual(req: FastifyRequest, reply: FastifyReply) {
    try {
      const user = (req as any).user

      const caixa = await caixaService.getCaixaAtual(user.establishmentId)

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
    } catch (error: any) {
      return reply.status(400).send({
        success: false,
        message: error.message,
      })
    }
  }

  /**
   * GET /caixa/movimentacoes
   */
  async getMovimentacoes(req: FastifyRequest, reply: FastifyReply) {
    try {
      const user = (req as any).user
      const query = req.query as any

      const page = parseInt(query.page) || 1
      const limit = parseInt(query.limit) || 20

      const result = await caixaService.getMovimentacoes(
        user.establishmentId,
        page,
        limit
      )

      return reply.send({
        success: true,
        ...result,
      })
    } catch (error: any) {
      return reply.status(400).send({
        success: false,
        message: error.message,
      })
    }
  }
}

export const caixaController = new CaixaController()
