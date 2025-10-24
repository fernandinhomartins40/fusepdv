import { useState } from 'react'
import { useCartStore } from '../store/useCartStore'
import { useAuthStore } from '../store/useAuthStore'
import api from '../lib/api'
import { generateCupomFiscal, printCupom } from '../lib/printer'

interface PaymentModalProps {
  total: number
  onClose: () => void
  onComplete: () => void
}

export default function PaymentModal({ total, onClose, onComplete }: PaymentModalProps) {
  const { items } = useCartStore()
  const { user } = useAuthStore()
  const [formaPagamento, setFormaPagamento] = useState('DINHEIRO')
  const [valorPago, setValorPago] = useState(total)
  const [loading, setLoading] = useState(false)
  const [imprimirCupom, setImprimirCupom] = useState(true)

  const troco = valorPago - total

  const handleFinalize = async () => {
    if (formaPagamento === 'DINHEIRO' && valorPago < total) {
      alert('Valor pago insuficiente')
      return
    }

    setLoading(true)

    try {
      const saleData = {
        items: items.map((item) => ({
          productId: item.productId,
          quantidade: item.quantidade,
          precoUnitario: item.precoUnitario,
          desconto: item.desconto,
        })),
        desconto: useCartStore.getState().desconto,
        formaPagamento,
      }

      const { data: sale } = await api.post('/sales', saleData)

      // Imprimir cupom se solicitado
      if (imprimirCupom) {
        try {
          const { data: establishment } = await api.get('/establishment')
          const cupom = generateCupomFiscal({
            ...sale,
            valorPago,
            troco: formaPagamento === 'DINHEIRO' ? troco : 0,
            formaPagamento
          }, establishment)
          await printCupom(cupom)
        } catch (error) {
          console.error('Erro ao imprimir cupom:', error)
          // Continua mesmo se falhar a impressão
        }
      }

      alert('Venda finalizada com sucesso!')
      onComplete()
    } catch (error: any) {
      alert('Erro ao finalizar venda: ' + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-2xl">
        <h2 className="mb-6 text-2xl font-bold">Finalizar Venda</h2>

        <div className="mb-6 rounded bg-blue-50 p-4">
          <div className="mb-2 flex justify-between text-xl">
            <span>Total:</span>
            <span className="font-bold">R$ {total.toFixed(2)}</span>
          </div>
        </div>

        <div className="mb-4">
          <label className="mb-2 block font-semibold">Forma de Pagamento:</label>
          <select
            value={formaPagamento}
            onChange={(e) => setFormaPagamento(e.target.value)}
            className="w-full rounded border p-2"
          >
            <option value="DINHEIRO">Dinheiro</option>
            <option value="DEBITO">Cartão de Débito</option>
            <option value="CREDITO">Cartão de Crédito</option>
            <option value="PIX">PIX</option>
          </select>
        </div>

        {formaPagamento === 'DINHEIRO' && (
          <>
            <div className="mb-4">
              <label className="mb-2 block font-semibold">Valor Pago:</label>
              <input
                type="number"
                value={valorPago}
                onChange={(e) => setValorPago(Number(e.target.value))}
                className="w-full rounded border p-2"
                step="0.01"
                min={total}
              />
            </div>

            {troco >= 0 && (
              <div className="mb-4 rounded bg-green-50 p-4">
                <div className="flex justify-between text-xl">
                  <span>Troco:</span>
                  <span className="font-bold text-green-600">R$ {troco.toFixed(2)}</span>
                </div>
              </div>
            )}
          </>
        )}

        <div className="mb-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={imprimirCupom}
              onChange={(e) => setImprimirCupom(e.target.checked)}
              className="h-4 w-4"
            />
            <span className="text-sm">Imprimir cupom</span>
          </label>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded bg-gray-500 py-3 text-white hover:bg-gray-600"
          >
            Cancelar
          </button>
          <button
            onClick={handleFinalize}
            disabled={loading}
            className="flex-1 rounded bg-green-600 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Finalizando...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  )
}
