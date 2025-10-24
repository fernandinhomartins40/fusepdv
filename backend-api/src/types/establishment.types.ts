import { z } from 'zod'

// Schema para atualizar estabelecimento
export const updateEstablishmentSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').optional(),
  telefone: z.string().optional(),
  endereco: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().length(2, 'Estado deve ter 2 caracteres').optional(),
  cep: z.string().regex(/^\d{8}$/, 'CEP deve conter 8 dígitos').optional(),
})

// Schema para criar usuário do estabelecimento
export const createUserSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  role: z.enum(['ADMIN', 'OPERADOR']).default('OPERADOR'),
})

// Schema para atualizar usuário
export const updateUserSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').optional(),
  email: z.string().email('Email inválido').optional(),
  senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres').optional(),
  role: z.enum(['ADMIN', 'OPERADOR']).optional(),
  ativo: z.boolean().optional(),
})

// Types
export type UpdateEstablishmentInput = z.infer<typeof updateEstablishmentSchema>
export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
