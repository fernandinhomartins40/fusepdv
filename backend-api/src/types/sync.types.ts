import { z } from 'zod'

// Schema para sincronizar produtos
export const syncProductsSchema = z.object({
  products: z.array(
    z.object({
      id: z.string().uuid().optional(),
      codigo: z.string(),
      ean: z.string().optional(),
      nome: z.string(),
      descricao: z.string().optional(),
      categoria: z.string().optional(),
      unidade: z.string(),
      precoCusto: z.number(),
      precoVenda: z.number(),
      estoque: z.number(),
      estoqueMinimo: z.number().optional(),
      ncm: z.string().optional(),
      cest: z.string().optional(),
      cfop: z.string().optional(),
      ativo: z.boolean(),
      updatedAt: z.string().or(z.date()),
    })
  ),
  lastSync: z.string().or(z.date()).optional(),
})

// Schema para sincronizar vendas
export const syncSalesSchema = z.object({
  sales: z.array(
    z.object({
      id: z.string().uuid().optional(),
      numero: z.number(),
      data: z.string().or(z.date()),
      subtotal: z.number(),
      desconto: z.number(),
      total: z.number(),
      formaPagamento: z.string(),
      observacoes: z.string().optional(),
      items: z.array(
        z.object({
          productId: z.string().uuid(),
          quantidade: z.number(),
          precoUnitario: z.number(),
          subtotal: z.number(),
          desconto: z.number(),
        })
      ),
    })
  ),
  lastSync: z.string().or(z.date()).optional(),
})

// Types
export type SyncProductsInput = z.infer<typeof syncProductsSchema>
export type SyncSalesInput = z.infer<typeof syncSalesSchema>

export interface SyncResponse {
  success: boolean
  synced: number
  errors: number
  conflicts?: any[]
}
