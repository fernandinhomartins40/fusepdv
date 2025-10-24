import bcrypt from 'bcrypt'
import { prisma } from '../database/prisma'
import type { RegisterInput, LoginInput, AuthResponse, TokenPayload } from '../types/auth.types'

const SALT_ROUNDS = 10

export class AuthService {
  async register(data: RegisterInput): Promise<AuthResponse> {
    // Verificar se CNPJ já existe
    const existingEstablishment = await prisma.establishment.findUnique({
      where: { cnpj: data.establishment.cnpj },
    })

    if (existingEstablishment) {
      throw new Error('CNPJ já cadastrado')
    }

    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: data.user.email },
    })

    if (existingUser) {
      throw new Error('Email já cadastrado')
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(data.user.senha, SALT_ROUNDS)

    // Criar estabelecimento e usuário em transação
    const result = await prisma.$transaction(async (tx) => {
      const establishment = await tx.establishment.create({
        data: {
          nome: data.establishment.nome,
          cnpj: data.establishment.cnpj,
          email: data.establishment.email,
          telefone: data.establishment.telefone,
          endereco: data.establishment.endereco,
          cidade: data.establishment.cidade,
          estado: data.establishment.estado,
          cep: data.establishment.cep,
        },
      })

      const user = await tx.user.create({
        data: {
          establishmentId: establishment.id,
          nome: data.user.nome,
          email: data.user.email,
          senha: hashedPassword,
          role: 'ADMIN', // Primeiro usuário é sempre admin
        },
      })

      return { establishment, user }
    })

    // Retornar sem tokens por enquanto (serão implementados com JWT)
    return {
      user: {
        id: result.user.id,
        nome: result.user.nome,
        email: result.user.email,
        role: result.user.role,
        establishmentId: result.user.establishmentId,
      },
      accessToken: '', // Será preenchido pelo controller
      refreshToken: '', // Será preenchido pelo controller
    }
  }

  async login(data: LoginInput) {
    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: {
        establishment: true,
      },
    })

    if (!user) {
      throw new Error('Credenciais inválidas')
    }

    if (!user.ativo) {
      throw new Error('Usuário inativo')
    }

    if (!user.establishment.ativo) {
      throw new Error('Estabelecimento inativo')
    }

    // Verificar senha
    const passwordMatch = await bcrypt.compare(data.senha, user.senha)

    if (!passwordMatch) {
      throw new Error('Credenciais inválidas')
    }

    return user
  }

  async saveRefreshToken(userId: string, token: string, expiresAt: Date) {
    await prisma.refreshToken.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    })
  }

  async verifyRefreshToken(token: string) {
    const refreshToken = await prisma.refreshToken.findUnique({
      where: { token },
      include: {
        user: {
          include: {
            establishment: true,
          },
        },
      },
    })

    if (!refreshToken) {
      throw new Error('Token inválido')
    }

    if (refreshToken.expiresAt < new Date()) {
      // Remover token expirado
      await prisma.refreshToken.delete({
        where: { id: refreshToken.id },
      })
      throw new Error('Token expirado')
    }

    if (!refreshToken.user.ativo) {
      throw new Error('Usuário inativo')
    }

    return refreshToken.user
  }

  async revokeRefreshToken(token: string) {
    await prisma.refreshToken.deleteMany({
      where: { token },
    })
  }

  async revokeAllUserTokens(userId: string) {
    await prisma.refreshToken.deleteMany({
      where: { userId },
    })
  }

  async cleanExpiredTokens() {
    await prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    })
  }
}

export const authService = new AuthService()
