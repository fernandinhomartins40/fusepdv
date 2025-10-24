import { useState, useRef, useEffect } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { useCartStore } from '../store/useCartStore'
import { useCaixaStore } from '../store/useCaixaStore'
import { useSyncStore } from '../store/useSyncStore'
import api from '../lib/api'
import ImportNFEModal from '../components/ImportNFEModal'
import ProductSearch from '../components/ProductSearch'
import CartView from '../components/CartView'
import PaymentModal from '../components/PaymentModal'
import CaixaModal from '../components/CaixaModal'
import ConfiguracoesModal from '../components/ConfiguracoesModal'

export default function POSPage() {
  const { user, logout } = useAuthStore()
  const { items, getTotal, clear } = useCartStore()
  const { caixaAtual, verificarCaixaAberto } = useCaixaStore()
  const { isSyncing, isOnline, lastSyncAt, syncAll } = useSyncStore()
  const [showImportModal, setShowImportModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showCaixaModal, setShowCaixaModal] = useState(false)
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [caixaModalTipo, setCaixaModalTipo] = useState<'ABERTURA' | 'FECHAMENTO' | 'SANGRIA' | 'REFORCO'>('ABERTURA')
  const [barcodeInput, setBarcodeInput] = useState('')
  const barcodeRef = useRef<HTMLInputElement>(null)

  // Verificar caixa aberto ao montar
  useEffect(() => {
    verificarCaixaAberto()
    barcodeRef.current?.focus()
  }, [])

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // F2 - Buscar produto
      if (e.key === 'F2') {
        e.preventDefault()
        // Abrir modal de busca
      }

      // F3 - Desconto
      if (e.key === 'F3') {
        e.preventDefault()
        // Aplicar desconto
      }

      // F4 - Cancelar item
      if (e.key === 'F4') {
        e.preventDefault()
        // Remover último item
      }

      // F5 - Finalizar venda
      if (e.key === 'F5') {
        e.preventDefault()
        if (items.length > 0) {
          setShowPaymentModal(true)
        }
      }

      // F6 - Importar NF-e
      if (e.key === 'F6') {
        e.preventDefault()
        setShowImportModal(true)
      }

      // F7 - Sangria
      if (e.key === 'F7') {
        e.preventDefault()
        if (caixaAtual) {
          setCaixaModalTipo('SANGRIA')
          setShowCaixaModal(true)
        }
      }

      // F8 - Reforço
      if (e.key === 'F8') {
        e.preventDefault()
        if (caixaAtual) {
          setCaixaModalTipo('REFORCO')
          setShowCaixaModal(true)
        }
      }

      // F9 - Configurações
      if (e.key === 'F9') {
        e.preventDefault()
        setShowConfigModal(true)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [items])

  const handleBarcodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!barcodeInput.trim()) return

    try {
      // Buscar produto por código ou EAN
      const { data } = await api.get(`/products/ean/${barcodeInput}`)

      if (data) {
        useCartStore.getState().addItem(data, 1)
        setBarcodeInput('')
        barcodeRef.current?.focus()
      }
    } catch (error) {
      // Tentar buscar por código
      try {
        const { data } = await api.get(`/products/code/${barcodeInput}`)
        if (data) {
          useCartStore.getState().addItem(data, 1)
          setBarcodeInput('')
          barcodeRef.current?.focus()
        }
      } catch {
        alert('Produto não encontrado')
        setBarcodeInput('')
      }
    }
  }

  const handleSaleComplete = () => {
    clear()
    setShowPaymentModal(false)
    barcodeRef.current?.focus()
  }

  return (
    <div className="flex h-screen flex-col bg-gray-100">
      {/* Header */}
      <header className="flex items-center justify-between bg-blue-600 px-6 py-4 text-white shadow-lg">
        <div>
          <h1 className="text-2xl font-bold">PDV Sistema</h1>
          <p className="text-sm opacity-90">{user?.nome} - Caixa 01</p>
          <div className="flex items-center gap-3 text-xs mt-1">
            <span className={`flex items-center gap-1 ${isOnline ? 'text-green-300' : 'text-red-300'}`}>
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-300' : 'bg-red-300'}`}></span>
              {isOnline ? 'Online' : 'Offline'}
            </span>
            {lastSyncAt && (
              <span className="opacity-75">
                Última sync: {new Date(lastSyncAt).toLocaleTimeString()}
              </span>
            )}
            {isSyncing && <span className="opacity-75">Sincronizando...</span>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!caixaAtual ? (
            <button
              onClick={() => {
                setCaixaModalTipo('ABERTURA')
                setShowCaixaModal(true)
              }}
              className="rounded bg-yellow-500 px-4 py-2 font-semibold hover:bg-yellow-600"
            >
              Abrir Caixa
            </button>
          ) : (
            <>
              <button
                onClick={() => {
                  setCaixaModalTipo('SANGRIA')
                  setShowCaixaModal(true)
                }}
                className="rounded bg-orange-500 px-3 py-2 text-sm font-semibold hover:bg-orange-600"
              >
                Sangria (F7)
              </button>
              <button
                onClick={() => {
                  setCaixaModalTipo('REFORCO')
                  setShowCaixaModal(true)
                }}
                className="rounded bg-purple-500 px-3 py-2 text-sm font-semibold hover:bg-purple-600"
              >
                Reforço (F8)
              </button>
              <button
                onClick={() => {
                  setCaixaModalTipo('FECHAMENTO')
                  setShowCaixaModal(true)
                }}
                className="rounded bg-red-500 px-3 py-2 text-sm font-semibold hover:bg-red-600"
              >
                Fechar Caixa
              </button>
            </>
          )}
          <button
            onClick={() => setShowImportModal(true)}
            className="rounded bg-green-500 px-4 py-2 font-semibold hover:bg-green-600"
          >
            NF-e (F6)
          </button>
          <button
            onClick={() => setShowConfigModal(true)}
            className="rounded bg-gray-500 px-3 py-2 text-sm font-semibold hover:bg-gray-600"
          >
            Config (F9)
          </button>
          <button
            onClick={logout}
            className="rounded bg-red-600 px-4 py-2 font-semibold hover:bg-red-700"
          >
            Sair
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Cart */}
        <div className="flex w-2/3 flex-col border-r bg-white p-6">
          <div className="mb-4">
            <form onSubmit={handleBarcodeSubmit} className="flex gap-2">
              <input
                ref={barcodeRef}
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                placeholder="Digite ou escaneie o código de barras..."
                className="flex-1 rounded-lg border-2 border-gray-300 px-4 py-3 text-lg focus:border-blue-500 focus:outline-none"
                autoFocus
              />
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
              >
                Adicionar
              </button>
            </form>
          </div>

          <ProductSearch onSelectProduct={(product) => {
            useCartStore.getState().addItem(product, 1)
            barcodeRef.current?.focus()
          }} />

          <CartView />
        </div>

        {/* Right Panel - Totals & Actions */}
        <div className="flex w-1/3 flex-col bg-white p-6">
          <div className="mb-6">
            <h2 className="mb-4 text-xl font-bold">Total da Venda</h2>
            <div className="rounded-lg bg-gray-50 p-6">
              <div className="mb-2 flex justify-between text-lg">
                <span>Subtotal:</span>
                <span>R$ {useCartStore.getState().getSubtotal().toFixed(2)}</span>
              </div>
              <div className="mb-4 flex justify-between text-lg">
                <span>Desconto:</span>
                <span className="text-red-600">
                  - R$ {useCartStore.getState().desconto.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between border-t-2 border-gray-300 pt-4 text-3xl font-bold text-blue-600">
                <span>TOTAL:</span>
                <span>R$ {getTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => items.length > 0 && setShowPaymentModal(true)}
            disabled={items.length === 0}
            className="mb-4 rounded-lg bg-green-600 px-6 py-4 text-xl font-bold text-white hover:bg-green-700 disabled:opacity-50"
          >
            Finalizar Venda (F5)
          </button>

          <div className="mt-auto space-y-2 text-sm text-gray-600">
            <p><strong>F2</strong> - Buscar Produto</p>
            <p><strong>F3</strong> - Aplicar Desconto</p>
            <p><strong>F4</strong> - Cancelar Item</p>
            <p><strong>F5</strong> - Finalizar Venda</p>
            <p><strong>F6</strong> - Importar NF-e</p>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showImportModal && (
        <ImportNFEModal onClose={() => setShowImportModal(false)} />
      )}

      {showPaymentModal && (
        <PaymentModal
          total={getTotal()}
          onClose={() => setShowPaymentModal(false)}
          onComplete={handleSaleComplete}
        />
      )}

      {showCaixaModal && (
        <CaixaModal
          isOpen={showCaixaModal}
          onClose={() => setShowCaixaModal(false)}
          tipo={caixaModalTipo}
        />
      )}

      {showConfigModal && (
        <ConfiguracoesModal
          isOpen={showConfigModal}
          onClose={() => setShowConfigModal(false)}
        />
      )}
    </div>
  )
}
