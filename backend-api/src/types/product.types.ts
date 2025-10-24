import { z } from 'zod'

// Validation Schemas
export const createProductSchema = z.object({
  codigo: z.string().min(1, 'Código é obrigatório'),
  ean: z.string().optional(),
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  descricao: z.string().optional(),
  categoria: z.string().optional(),
  unidade: z.string().default('UN'),
  precoCusto: z.number().min(0, 'Preço de custo não pode ser negativo').default(0),
  precoVenda: z.number().min(0, 'Preço de venda não pode ser negativo'),
  estoque: z.number().default(0),
  estoqueMinimo: z.number().optional(),
  ncm: z.string().optional(),
  cest: z.string().optional(),
  cfop: z.string().optional(),
  ativo: z.boolean().default(true),
})

export const updateProductSchema = createProductSchema.partial()

export const bulkCreateProductsSchema = z.object({
  products: z.array(createProductSchema),
})

// Types
export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
export type BulkCreateProductsInput = z.infer<typeof bulkCreateProductsSchema>

export interface ProductFilter {
  search?: string
  categoria?: string
  ativo?: boolean
  estoqueMinimo?: boolean
}
