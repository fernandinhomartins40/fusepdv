import { FastifyRequest, FastifyReply } from 'fastify'
import { authService } from '../services/auth.service'
import type { RegisterInput, LoginInput, RefreshTokenInput, TokenPayload } from '../types/auth.types'

export class AuthController {
  async register(request: FastifyRequest<{ Body: RegisterInput }>, reply: FastifyReply) {
    try {
      const result = await authService.register(request.body)

      // Criar tokens JWT
      const accessToken = request.server.jwt.sign(
        {
          userId: result.user.id,
          establishmentId: result.user.establishmentId,
          email: result.user.email,
          role: result.user.role,
        } as TokenPayload,
        { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' }
      )

      const refreshToken = request.server.jwt.sign(
        {
          userId: result.user.id,
          establishmentId: result.user.establishmentId,
          email: result.user.email,
          role: result.user.role,
        } as TokenPayload,
        {
          expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
          sign: { algorithm: 'HS256' },
        }
      )

      // Salvar refresh token
      const refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d'
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7) // 7 dias

      await authService.saveRefreshToken(result.user.id, refreshToken, expiresAt)

      return reply.status(201).send({
        user: result.user,
        accessToken,
        refreshToken,
      })
    } catch (error) {
      if (error instanceof Error) {
        return reply.status(400).send({
          error: 'Erro ao registrar',
          message: error.message,
        })
      }
      return reply.status(500).send({
        error: 'Erro interno do servidor',
      })
    }
  }

  async login(request: FastifyRequest<{ Body: LoginInput }>, reply: FastifyReply) {
    try {
      const user = await authService.login(request.body)

      // Criar tokens JWT
      const accessToken = request.server.jwt.sign(
        {
          userId: user.id,
          establishmentId: user.establishmentId,
          email: user.email,
          role: user.role,
        } as TokenPayload,
        { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' }
      )

      const refreshToken = request.server.jwt.sign(
        {
          userId: user.id,
          establishmentId: user.establishmentId,
          email: user.email,
          role: user.role,
        } as TokenPayload,
        {
          expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
          sign: { algorithm: 'HS256' },
        }
      )

      // Salvar refresh token
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7) // 7 dias

      await authService.saveRefreshToken(user.id, refreshToken, expiresAt)

      return reply.status(200).send({
        user: {
          id: user.id,
          nome: user.nome,
          email: user.email,
          role: user.role,
          establishmentId: user.establishmentId,
        },
        accessToken,
        refreshToken,
      })
    } catch (error) {
      if (error instanceof Error) {
        return reply.status(401).send({
          error: 'Erro ao fazer login',
          message: error.message,
        })
      }
      return reply.status(500).send({
        error: 'Erro interno do servidor',
      })
    }
  }

  async refresh(request: FastifyRequest<{ Body: RefreshTokenInput }>, reply: FastifyReply) {
    try {
      const { refreshToken } = request.body

      // Verificar refresh token
      const user = await authService.verifyRefreshToken(refreshToken)

      // Criar novo access token
      const newAccessToken = request.server.jwt.sign(
        {
          userId: user.id,
          establishmentId: user.establishmentId,
          email: user.email,
          role: user.role,
        } as TokenPayload,
        { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' }
      )

      return reply.status(200).send({
        accessToken: newAccessToken,
      })
    } catch (error) {
      if (error instanceof Error) {
        return reply.status(401).send({
          error: 'Erro ao renovar token',
          message: error.message,
        })
      }
      return reply.status(500).send({
        error: 'Erro interno do servidor',
      })
    }
  }

  async logout(request: FastifyRequest<{ Body: RefreshTokenInput }>, reply: FastifyReply) {
    try {
      const { refreshToken } = request.body

      await authService.revokeRefreshToken(refreshToken)

      return reply.status(200).send({
        message: 'Logout realizado com sucesso',
      })
    } catch (error) {
      return reply.status(500).send({
        error: 'Erro ao fazer logout',
      })
    }
  }

  async me(request: FastifyRequest, reply: FastifyReply) {
    try {
      // O user já está disponível no request graças ao middleware de autenticação
      const userId = request.user?.userId

      if (!userId) {
        return reply.status(401).send({
          error: 'Não autorizado',
        })
      }

      // Buscar dados atualizados do usuário
      const { prisma } = await import('../database/prisma')
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          nome: true,
          email: true,
          role: true,
          establishmentId: true,
          establishment: {
            select: {
              nome: true,
              cnpj: true,
            },
          },
        },
      })

      if (!user) {
        return reply.status(404).send({
          error: 'Usuário não encontrado',
        })
      }

      return reply.status(200).send(user)
    } catch (error) {
      return reply.status(500).send({
        error: 'Erro ao buscar dados do usuário',
      })
    }
  }
}

export const authController = new AuthController()
