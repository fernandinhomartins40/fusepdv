import { z } from 'zod'

// Validation Schemas
export const registerSchema = z.object({
  establishment: z.object({
    nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
    cnpj: z.string().regex(/^\d{14}$/, 'CNPJ deve conter 14 dígitos'),
    email: z.string().email('Email inválido'),
    telefone: z.string().optional(),
    endereco: z.string().optional(),
    cidade: z.string().optional(),
    estado: z.string().length(2, 'Estado deve ter 2 caracteres').optional(),
    cep: z.string().regex(/^\d{8}$/, 'CEP deve conter 8 dígitos').optional(),
  }),
  user: z.object({
    nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
    email: z.string().email('Email inválido'),
    senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  }),
})

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  senha: z.string().min(1, 'Senha é obrigatória'),
})

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token é obrigatório'),
})

// Types
export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>

export interface TokenPayload {
  userId: string
  establishmentId: string
  email: string
  role: string
}

export interface AuthResponse {
  user: {
    id: string
    nome: string
    email: string
    role: string
    establishmentId: string
  }
  accessToken: string
  refreshToken: string
}
