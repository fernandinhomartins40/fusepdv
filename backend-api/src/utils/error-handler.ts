import { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import { logger } from './logger'

export interface AppError extends Error {
  statusCode?: number
  code?: string
}

export class ValidationError extends Error {
  statusCode = 400
  code = 'VALIDATION_ERROR'

  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class NotFoundError extends Error {
  statusCode = 404
  code = 'NOT_FOUND'

  constructor(message: string = 'Recurso não encontrado') {
    super(message)
    this.name = 'NotFoundError'
  }
}

export class UnauthorizedError extends Error {
  statusCode = 401
  code = 'UNAUTHORIZED'

  constructor(message: string = 'Não autorizado') {
    super(message)
    this.name = 'UnauthorizedError'
  }
}

export class ForbiddenError extends Error {
  statusCode = 403
  code = 'FORBIDDEN'

  constructor(message: string = 'Acesso negado') {
    super(message)
    this.name = 'ForbiddenError'
  }
}

export class ConflictError extends Error {
  statusCode = 409
  code = 'CONFLICT'

  constructor(message: string) {
    super(message)
    this.name = 'ConflictError'
  }
}

export async function errorHandler(
  error: FastifyError | AppError,
  request: FastifyRequest,
  reply: FastifyReply
) {
  // Log error
  logger.error({
    err: error,
    req: {
      method: request.method,
      url: request.url,
      params: request.params,
      query: request.query,
    },
  }, 'Request error')

  // Custom app errors
  if ('statusCode' in error && error.statusCode) {
    return reply.status(error.statusCode).send({
      error: error.name || 'Error',
      message: error.message,
      code: (error as AppError).code,
    })
  }

  // Fastify/Validation errors
  if (error.validation) {
    return reply.status(400).send({
      error: 'Validation Error',
      message: 'Dados de entrada inválidos',
      code: 'VALIDATION_ERROR',
      details: error.validation,
    })
  }

  // Prisma errors
  if (error.message.includes('Unique constraint')) {
    return reply.status(409).send({
      error: 'Conflict',
      message: 'Registro duplicado',
      code: 'DUPLICATE_ENTRY',
    })
  }

  if (error.message.includes('Record to update not found')) {
    return reply.status(404).send({
      error: 'Not Found',
      message: 'Registro não encontrado',
      code: 'NOT_FOUND',
    })
  }

  // Default server error
  return reply.status(500).send({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production'
      ? 'Erro interno do servidor'
      : error.message,
    code: 'INTERNAL_ERROR',
  })
}
