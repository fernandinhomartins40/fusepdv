import { create } from 'zustand'
import api from '../lib/api'

interface CaixaMovimentacao {
  id: string
  tipo: 'ABERTURA' | 'SANGRIA' | 'REFORCO' | 'FECHAMENTO'
  valor: number
  descricao?: string
  createdAt: Date
}

interface Caixa {
  id: string
  aberturaAt: Date
  valorAbertura: number
  valorEsperado: number
  valorInformado?: number
  status: 'ABERTO' | 'FECHADO'
  userId: string
  movimentacoes: CaixaMovimentacao[]
}

interface CaixaState {
  caixaAtual: Caixa | null
  isLoading: boolean
  verificarCaixaAberto: () => Promise<void>
  abrirCaixa: (valorAbertura: number) => Promise<void>
  fecharCaixa: (valorInformado: number, observacoes?: string) => Promise<void>
  registrarSangria: (valor: number, descricao: string) => Promise<void>
  registrarReforco: (valor: number, descricao: string) => Promise<void>
  getCaixaAtual: () => Promise<void>
}

export const useCaixaStore = create<CaixaState>((set, get) => ({
  caixaAtual: null,
  isLoading: false,

  verificarCaixaAberto: async () => {
    try {
      const { data } = await api.get('/caixa/atual')
      set({ caixaAtual: data.status === 'ABERTO' ? data : null })
      return data
    } catch (error) {
      set({ caixaAtual: null })
      return null
    }
  },

  abrirCaixa: async (valorAbertura: number) => {
    set({ isLoading: true })
    try {
      const { data } = await api.post('/caixa/abrir', { valorAbertura })
      set({ caixaAtual: data, isLoading: false })
    } catch (error: any) {
      set({ isLoading: false })
      throw new Error(error.response?.data?.message || 'Erro ao abrir caixa')
    }
  },

  fecharCaixa: async (valorInformado: number, observacoes?: string) => {
    set({ isLoading: true })
    try {
      const { data } = await api.post('/caixa/fechar', {
        valorInformado,
        observacoes
      })
      set({ caixaAtual: null, isLoading: false })
      return data
    } catch (error: any) {
      set({ isLoading: false })
      throw new Error(error.response?.data?.message || 'Erro ao fechar caixa')
    }
  },

  registrarSangria: async (valor: number, descricao: string) => {
    set({ isLoading: true })
    try {
      const { data } = await api.post('/caixa/sangria', {
        valor,
        descricao
      })
      set({ caixaAtual: data, isLoading: false })
    } catch (error: any) {
      set({ isLoading: false })
      throw new Error(error.response?.data?.message || 'Erro ao registrar sangria')
    }
  },

  registrarReforco: async (valor: number, descricao: string) => {
    set({ isLoading: true })
    try {
      const { data } = await api.post('/caixa/reforco', {
        valor,
        descricao
      })
      set({ caixaAtual: data, isLoading: false })
    } catch (error: any) {
      set({ isLoading: false })
      throw new Error(error.response?.data?.message || 'Erro ao registrar reforço')
    }
  },

  getCaixaAtual: async () => {
    set({ isLoading: true })
    try {
      const { data } = await api.get('/caixa/atual')
      set({ caixaAtual: data, isLoading: false })
    } catch (error) {
      set({ caixaAtual: null, isLoading: false })
    }
  }
}))
