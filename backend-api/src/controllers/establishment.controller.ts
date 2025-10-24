import { FastifyRequest, FastifyReply } from 'fastify'
import { establishmentService } from '../services/establishment.service'
import type { UpdateEstablishmentInput, CreateUserInput, UpdateUserInput } from '../types/establishment.types'

export class EstablishmentController {
  async get(request: FastifyRequest, reply: FastifyReply) {
    try {
      const establishmentId = request.user?.establishmentId

      if (!establishmentId) {
        return reply.status(401).send({ error: 'Não autorizado' })
      }

      const establishment = await establishmentService.findById(establishmentId)

      return reply.status(200).send(establishment)
    } catch (error) {
      if (error instanceof Error) {
        return reply.status(404).send({
          error: 'Estabelecimento não encontrado',
          message: error.message,
        })
      }
      return reply.status(500).send({ error: 'Erro interno do servidor' })
    }
  }

  async update(request: FastifyRequest<{ Body: UpdateEstablishmentInput }>, reply: FastifyReply) {
    try {
      const establishmentId = request.user?.establishmentId

      if (!establishmentId) {
        return reply.status(401).send({ error: 'Não autorizado' })
      }

      // Apenas admin pode atualizar
      if (request.user?.role !== 'ADMIN') {
        return reply.status(403).send({ error: 'Apenas administradores podem atualizar estabelecimento' })
      }

      const establishment = await establishmentService.update(establishmentId, request.body)

      return reply.status(200).send(establishment)
    } catch (error) {
      if (error instanceof Error) {
        return reply.status(400).send({
          error: 'Erro ao atualizar estabelecimento',
          message: error.message,
        })
      }
      return reply.status(500).send({ error: 'Erro interno do servidor' })
    }
  }

  async getStats(request: FastifyRequest, reply: FastifyReply) {
    try {
      const establishmentId = request.user?.establishmentId

      if (!establishmentId) {
        return reply.status(401).send({ error: 'Não autorizado' })
      }

      const stats = await establishmentService.getStats(establishmentId)

      return reply.status(200).send(stats)
    } catch (error) {
      return reply.status(500).send({ error: 'Erro ao buscar estatísticas' })
    }
  }

  async getUsers(request: FastifyRequest, reply: FastifyReply) {
    try {
      const establishmentId = request.user?.establishmentId

      if (!establishmentId) {
        return reply.status(401).send({ error: 'Não autorizado' })
      }

      const users = await establishmentService.getUsers(establishmentId)

      return reply.status(200).send(users)
    } catch (error) {
      return reply.status(500).send({ error: 'Erro ao listar usuários' })
    }
  }

  async createUser(request: FastifyRequest<{ Body: CreateUserInput }>, reply: FastifyReply) {
    try {
      const establishmentId = request.user?.establishmentId

      if (!establishmentId) {
        return reply.status(401).send({ error: 'Não autorizado' })
      }

      // Apenas admin pode criar usuários
      if (request.user?.role !== 'ADMIN') {
        return reply.status(403).send({ error: 'Apenas administradores podem criar usuários' })
      }

      const user = await establishmentService.createUser(establishmentId, request.body)

      return reply.status(201).send(user)
    } catch (error) {
      if (error instanceof Error) {
        return reply.status(400).send({
          error: 'Erro ao criar usuário',
          message: error.message,
        })
      }
      return reply.status(500).send({ error: 'Erro interno do servidor' })
    }
  }

  async updateUser(
    request: FastifyRequest<{ Params: { userId: string }; Body: UpdateUserInput }>,
    reply: FastifyReply
  ) {
    try {
      const establishmentId = request.user?.establishmentId

      if (!establishmentId) {
        return reply.status(401).send({ error: 'Não autorizado' })
      }

      // Apenas admin pode atualizar usuários
      if (request.user?.role !== 'ADMIN') {
        return reply.status(403).send({ error: 'Apenas administradores podem atualizar usuários' })
      }

      const user = await establishmentService.updateUser(
        request.params.userId,
        establishmentId,
        request.body
      )

      return reply.status(200).send(user)
    } catch (error) {
      if (error instanceof Error) {
        return reply.status(400).send({
          error: 'Erro ao atualizar usuário',
          message: error.message,
        })
      }
      return reply.status(500).send({ error: 'Erro interno do servidor' })
    }
  }

  async deactivateUser(
    request: FastifyRequest<{ Params: { userId: string } }>,
    reply: FastifyReply
  ) {
    try {
      const establishmentId = request.user?.establishmentId

      if (!establishmentId) {
        return reply.status(401).send({ error: 'Não autorizado' })
      }

      // Apenas admin pode desativar usuários
      if (request.user?.role !== 'ADMIN') {
        return reply.status(403).send({ error: 'Apenas administradores podem desativar usuários' })
      }

      await establishmentService.deactivateUser(request.params.userId, establishmentId)

      return reply.status(204).send()
    } catch (error) {
      if (error instanceof Error) {
        return reply.status(400).send({
          error: 'Erro ao desativar usuário',
          message: error.message,
        })
      }
      return reply.status(500).send({ error: 'Erro interno do servidor' })
    }
  }
}

export const establishmentController = new EstablishmentController()
