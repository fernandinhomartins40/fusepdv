import { FastifyRequest, FastifyReply } from 'fastify'
// Request types module declaration is loaded globally from server.ts

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    // O @fastify/jwt adiciona o método verify ao request
    await request.jwtVerify()
  } catch (error) {
    return reply.status(401).send({
      error: 'Não autorizado',
      message: 'Token inválido ou expirado',
    })
  }
}

export async function requireAdmin(request: FastifyRequest, reply: FastifyReply) {
  if (!request.user) {
    return reply.status(401).send({
      error: 'Não autorizado',
      message: 'Autenticação necessária',
    })
  }

  if (request.user.role !== 'ADMIN') {
    return reply.status(403).send({
      error: 'Acesso negado',
      message: 'Apenas administradores podem acessar este recurso',
    })
  }
}
