import { useState, useEffect } from 'react'
import { useSyncStore } from '../store/useSyncStore'

interface ConfiguracoesModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ConfiguracoesModal({ isOpen, onClose }: ConfiguracoesModalProps) {
  const [apiUrl, setApiUrl] = useState('')
  const [margemLucro, setMargemLucro] = useState('30')
  const [impressora, setImpressora] = useState('')
  const [autoSync, setAutoSync] = useState(true)

  const { toggleAutoSync } = useSyncStore()

  useEffect(() => {
    if (isOpen) {
      // Load from localStorage or electron-store
      const savedUrl = localStorage.getItem('apiUrl') || 'http://localhost:3333'
      const savedMargem = localStorage.getItem('margemLucro') || '30'
      const savedImpressora = localStorage.getItem('impressora') || ''
      const savedAutoSync = localStorage.getItem('autoSync') !== 'false'

      setApiUrl(savedUrl)
      setMargemLucro(savedMargem)
      setImpressora(savedImpressora)
      setAutoSync(savedAutoSync)
    }
  }, [isOpen])

  const handleSave = () => {
    localStorage.setItem('apiUrl', apiUrl)
    localStorage.setItem('margemLucro', margemLucro)
    localStorage.setItem('impressora', impressora)
    localStorage.setItem('autoSync', autoSync.toString())

    if (useSyncStore.getState().autoSync !== autoSync) {
      toggleAutoSync()
    }

    alert('Configurações salvas com sucesso!')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Configurações</h2>

        <div className="space-y-4">
          {/* Servidor */}
          <div>
            <h3 className="font-medium mb-2">Servidor</h3>
            <label className="block text-sm mb-1">URL da API</label>
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="http://localhost:3333"
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          {/* Sincronização */}
          <div>
            <h3 className="font-medium mb-2">Sincronização</h3>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={autoSync}
                onChange={(e) => setAutoSync(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">Sincronização automática (a cada 5 minutos)</span>
            </label>
          </div>

          {/* Produtos */}
          <div>
            <h3 className="font-medium mb-2">Produtos</h3>
            <label className="block text-sm mb-1">Margem de Lucro Padrão (%)</label>
            <input
              type="number"
              value={margemLucro}
              onChange={(e) => setMargemLucro(e.target.value)}
              placeholder="30"
              className="w-full px-3 py-2 border rounded-md"
              min="0"
              max="1000"
            />
          </div>

          {/* Impressora */}
          <div>
            <h3 className="font-medium mb-2">Impressão</h3>
            <label className="block text-sm mb-1">Impressora Padrão</label>
            <input
              type="text"
              value={impressora}
              onChange={(e) => setImpressora(e.target.value)}
              placeholder="Nome da impressora"
              className="w-full px-3 py-2 border rounded-md"
            />
            <p className="text-xs text-gray-500 mt-1">
              Deixe em branco para usar a impressora padrão do sistema
            </p>
          </div>

          {/* Atalhos */}
          <div>
            <h3 className="font-medium mb-2">Atalhos de Teclado</h3>
            <div className="text-sm space-y-1 text-gray-600">
              <div><kbd className="px-2 py-1 bg-gray-100 rounded">F2</kbd> - Buscar Produto</div>
              <div><kbd className="px-2 py-1 bg-gray-100 rounded">F3</kbd> - Cancelar Item</div>
              <div><kbd className="px-2 py-1 bg-gray-100 rounded">F4</kbd> - Cancelar Venda</div>
              <div><kbd className="px-2 py-1 bg-gray-100 rounded">F5</kbd> - Finalizar Venda</div>
              <div><kbd className="px-2 py-1 bg-gray-100 rounded">F6</kbd> - Importar NF-e</div>
              <div><kbd className="px-2 py-1 bg-gray-100 rounded">F7</kbd> - Sangria</div>
              <div><kbd className="px-2 py-1 bg-gray-100 rounded">F8</kbd> - Reforço</div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border rounded-md hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  )
}
