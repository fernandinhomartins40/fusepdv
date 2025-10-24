import { z } from 'zod'

// Schema para validação de upload de NF-e
export const parseNfeSchema = z.object({
  xmlContent: z.string().min(1, 'Conteúdo XML é obrigatório'),
})

// Schema para buscar histórico
export const nfeHistoryQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

// Types
export type ParseNfeInput = z.infer<typeof parseNfeSchema>
export type NfeHistoryQuery = z.infer<typeof nfeHistoryQuerySchema>

// Tipos para dados extraídos da NF-e
export interface NfeFornecedor {
  cnpj: string
  nome: string
  razaoSocial?: string
  inscricaoEstadual?: string
  endereco?: {
    logradouro?: string
    numero?: string
    complemento?: string
    bairro?: string
    municipio?: string
    uf?: string
    cep?: string
  }
}

export interface NfeProdutoExtraido {
  codigo: string
  ean?: string
  nome: string
  descricao?: string
  ncm?: string
  cest?: string
  cfop?: string
  unidade: string
  quantidade: number
  precoUnitario: number
  valorTotal: number
  impostos?: {
    icms?: {
      aliquota?: number
      valor?: number
    }
    pis?: {
      aliquota?: number
      valor?: number
    }
    cofins?: {
      aliquota?: number
      valor?: number
    }
  }
}

export interface NfeInfoGeral {
  chaveAcesso: string
  numero: string
  serie: string
  modelo: string
  dataEmissao: Date
  valorTotal: number
  naturezaOperacao?: string
}

export interface NfeParsedResult {
  info: NfeInfoGeral
  fornecedor: NfeFornecedor
  produtos: NfeProdutoExtraido[]
  totalProdutos: number
}

// Response do endpoint de parse
export interface ParseNfeResponse extends NfeParsedResult {
  success: true
}

export interface ParseNfeError {
  success: false
  error: string
  details?: string
}
