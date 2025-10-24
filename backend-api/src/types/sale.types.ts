import { z } from 'zod'

// Schema para criar venda
export const createSaleSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().uuid('ID do produto inválido'),
      quantidade: z.number().positive('Quantidade deve ser positiva'),
      precoUnitario: z.number().positive('Preço unitário deve ser positivo'),
      desconto: z.number().min(0, 'Desconto não pode ser negativo').optional().default(0),
    })
  ).min(1, 'Venda deve ter pelo menos um item'),
  desconto: z.number().min(0, 'Desconto não pode ser negativo').optional().default(0),
  formaPagamento: z.string().min(1, 'Forma de pagamento é obrigatória'),
  observacoes: z.string().optional(),
})

// Schema para cancelar venda
export const cancelSaleSchema = z.object({
  motivo: z.string().optional(),
})

// Schema para filtros de relatório
export const salesReportSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  formaPagamento: z.string().optional(),
  userId: z.string().optional(),
})

// Types
export type CreateSaleInput = z.infer<typeof createSaleSchema>
export type CancelSaleInput = z.infer<typeof cancelSaleSchema>
export type SalesReportQuery = z.infer<typeof salesReportSchema>

export interface SaleItem {
  productId: string
  quantidade: number
  precoUnitario: number
  desconto?: number
}

export interface SaleWithItems {
  id: string
  numero: number
  data: Date
  subtotal: number
  desconto: number
  total: number
  status: string
  formaPagamento: string
  observacoes?: string
  user: {
    id: string
    nome: string
  }
  items: Array<{
    id: string
    quantidade: number
    precoUnitario: number
    subtotal: number
    desconto: number
    product: {
      id: string
      codigo: string
      nome: string
      unidade: string
    }
  }>
}

export interface SalesReport {
  totalVendas: number
  valorTotal: number
  ticketMedio: number
  vendasPorDia: Array<{
    data: string
    quantidade: number
    valor: number
  }>
  vendasPorFormaPagamento: Array<{
    formaPagamento: string
    quantidade: number
    valor: number
  }>
  produtosMaisVendidos: Array<{
    productId: string
    nome: string
    quantidade: number
    valor: number
  }>
}
