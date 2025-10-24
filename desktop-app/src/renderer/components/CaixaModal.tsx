import { useState, useEffect } from 'react'
import { useCaixaStore } from '../store/useCaixaStore'

interface CaixaModalProps {
  isOpen: boolean
  onClose: () => void
  tipo: 'ABERTURA' | 'FECHAMENTO' | 'SANGRIA' | 'REFORCO'
}

export default function CaixaModal({ isOpen, onClose, tipo }: CaixaModalProps) {
  const [valor, setValor] = useState('')
  const [descricao, setDescricao] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [loading, setLoading] = useState(false)

  const { abrirCaixa, fecharCaixa, registrarSangria, registrarReforco, caixaAtual } = useCaixaStore()

  useEffect(() => {
    if (!isOpen) {
      setValor('')
      setDescricao('')
      setObservacoes('')
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const valorNum = parseFloat(valor.replace(',', '.'))

      switch (tipo) {
        case 'ABERTURA':
          await abrirCaixa(valorNum)
          alert('Caixa aberto com sucesso!')
          break
        case 'FECHAMENTO':
          const resultado = await fecharCaixa(valorNum, observacoes)
          const diferenca = resultado.diferenca
          const msg = diferenca === 0
            ? 'Caixa fechado! Valores conferem.'
            : `Caixa fechado! Diferença: R$ ${Math.abs(diferenca).toFixed(2)} ${diferenca > 0 ? '(sobra)' : '(falta)'}`
          alert(msg)
          break
        case 'SANGRIA':
          await registrarSangria(valorNum, descricao)
          alert('Sangria registrada com sucesso!')
          break
        case 'REFORCO':
          await registrarReforco(valorNum, descricao)
          alert('Reforço registrado com sucesso!')
          break
      }
      onClose()
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const getTitulo = () => {
    switch (tipo) {
      case 'ABERTURA': return 'Abertura de Caixa'
      case 'FECHAMENTO': return 'Fechamento de Caixa'
      case 'SANGRIA': return 'Sangria'
      case 'REFORCO': return 'Reforço'
    }
  }

  const getLabel = () => {
    switch (tipo) {
      case 'ABERTURA': return 'Valor de Abertura'
      case 'FECHAMENTO': return 'Valor em Caixa'
      default: return 'Valor'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">{getTitulo()}</h2>

        {tipo === 'FECHAMENTO' && caixaAtual && (
          <div className="mb-4 p-4 bg-gray-100 rounded">
            <div className="flex justify-between mb-2">
              <span className="font-medium">Abertura:</span>
              <span>R$ {caixaAtual.valorAbertura.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="font-medium">Esperado:</span>
              <span>R$ {caixaAtual.valorEsperado.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Vendas:</span>
              <span>R$ {(caixaAtual.valorEsperado - caixaAtual.valorAbertura).toFixed(2)}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              {getLabel()}
            </label>
            <input
              type="text"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="0,00"
              className="w-full px-3 py-2 border rounded-md"
              required
              autoFocus
            />
          </div>

          {(tipo === 'SANGRIA' || tipo === 'REFORCO') && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Descrição
              </label>
              <input
                type="text"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Motivo da movimentação"
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
          )}

          {tipo === 'FECHAMENTO' && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Observações (opcional)
              </label>
              <textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Observações sobre o fechamento"
                className="w-full px-3 py-2 border rounded-md"
                rows={3}
              />
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-md hover:bg-gray-50"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Processando...' : 'Confirmar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
