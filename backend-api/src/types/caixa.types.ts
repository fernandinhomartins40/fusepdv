import { z } from 'zod'

// Schema para abertura de caixa
export const abrirCaixaSchema = z.object({
  valorInicial: z.number().positive('Valor inicial deve ser positivo'),
  observacoes: z.string().optional(),
})

// Schema para fechamento de caixa
export const fecharCaixaSchema = z.object({
  valorFinal: z.number().nonnegative('Valor final não pode ser negativo'),
  observacoes: z.string().optional(),
})

// Schema para sangria
export const sangriaSchema = z.object({
  valor: z.number().positive('Valor da sangria deve ser positivo'),
  observacoes: z.string().optional(),
})

// Schema para reforço
export const reforcoSchema = z.object({
  valor: z.number().positive('Valor do reforço deve ser positivo'),
  observacoes: z.string().optional(),
})

// Schema para consulta de movimentações
export const movimentacoesQuerySchema = z.object({
  dataInicio: z.string().optional(),
  dataFim: z.string().optional(),
  tipo: z.enum(['ABERTURA', 'FECHAMENTO', 'SANGRIA', 'REFORCO']).optional(),
  limit: z.string().transform(Number).optional(),
  offset: z.string().transform(Number).optional(),
})

// Types
export type AbrirCaixaInput = z.infer<typeof abrirCaixaSchema>
export type FecharCaixaInput = z.infer<typeof fecharCaixaSchema>
export type SangriaInput = z.infer<typeof sangriaSchema>
export type ReforcoInput = z.infer<typeof reforcoSchema>
export type MovimentacoesQuery = z.infer<typeof movimentacoesQuerySchema>
