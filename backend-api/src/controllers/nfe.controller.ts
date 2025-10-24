import { FastifyRequest, FastifyReply } from 'fastify'
import { nfeService } from '../services/nfe.service'
import type { ParseNfeInput, NfeHistoryQuery } from '../types/nfe.types'

export class NfeController {
  /**
   * POST /nfe/parse
   * Parseia XML de NF-e e retorna produtos extraídos
   */
  async parse(request: FastifyRequest<{ Body: ParseNfeInput }>, reply: FastifyReply) {
    try {
      const establishmentId = request.user?.establishmentId

      if (!establishmentId) {
        return reply.status(401).send({ error: 'Não autorizado' })
      }

      const { xmlContent } = request.body

      // Parsear XML
      const parsed = await nfeService.parseXML(xmlContent)

      // Verificar se já foi importada
      const exists = await nfeService.checkIfExists(parsed.info.chaveAcesso, establishmentId)

      // Salvar registro da importação
      await nfeService.saveImport(establishmentId, parsed, xmlContent)

      return reply.status(200).send({
        success: true,
        alreadyImported: exists,
        ...parsed,
      })
    } catch (error) {
      if (error instanceof Error) {
        return reply.status(400).send({
          success: false,
          error: 'Erro ao parsear NF-e',
          details: error.message,
        })
      }
      return reply.status(500).send({
        success: false,
        error: 'Erro interno do servidor',
      })
    }
  }

  /**
   * GET /nfe/history
   * Retorna histórico de importações
   */
  async history(
    request: FastifyRequest<{ Querystring: NfeHistoryQuery }>,
    reply: FastifyReply
  ) {
    try {
      const establishmentId = request.user?.establishmentId

      if (!establishmentId) {
        return reply.status(401).send({ error: 'Não autorizado' })
      }

      const page = parseInt(request.query.page || '1')
      const limit = parseInt(request.query.limit || '20')

      const filters: any = {}
      if (request.query.startDate) {
        filters.startDate = new Date(request.query.startDate)
      }
      if (request.query.endDate) {
        filters.endDate = new Date(request.query.endDate)
      }

      const result = await nfeService.getHistory(establishmentId, page, limit, filters)

      return reply.status(200).send(result)
    } catch (error) {
      return reply.status(500).send({
        error: 'Erro ao buscar histórico',
      })
    }
  }

  /**
   * GET /nfe/:id
   * Busca detalhes de uma importação específica
   */
  async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const establishmentId = request.user?.establishmentId

      if (!establishmentId) {
        return reply.status(401).send({ error: 'Não autorizado' })
      }

      const nfeImport = await nfeService.getImportById(request.params.id, establishmentId)

      return reply.status(200).send(nfeImport)
    } catch (error) {
      if (error instanceof Error) {
        return reply.status(404).send({
          error: 'Importação não encontrada',
          message: error.message,
        })
      }
      return reply.status(500).send({
        error: 'Erro interno do servidor',
      })
    }
  }

  /**
   * GET /nfe/:id/xml
   * Download do XML original
   */
  async downloadXML(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const establishmentId = request.user?.establishmentId

      if (!establishmentId) {
        return reply.status(401).send({ error: 'Não autorizado' })
      }

      const xml = await nfeService.getXML(request.params.id, establishmentId)

      return reply
        .status(200)
        .header('Content-Type', 'application/xml')
        .header('Content-Disposition', `attachment; filename="nfe-${request.params.id}.xml"`)
        .send(xml)
    } catch (error) {
      if (error instanceof Error) {
        return reply.status(404).send({
          error: 'XML não encontrado',
          message: error.message,
        })
      }
      return reply.status(500).send({
        error: 'Erro interno do servidor',
      })
    }
  }
}

export const nfeController = new NfeController()
