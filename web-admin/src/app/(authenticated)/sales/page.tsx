'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { Eye } from 'lucide-react'

interface Sale {
  id: string
  numero: number
  data: string
  total: number
  formaPagamento: string
  status: string
  user: {
    nome: string
  }
  items: Array<{
    quantidade: number
    precoUnitario: number
    subtotal: number
    product: {
      nome: string
    }
  }>
}

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)

  useEffect(() => {
    loadSales()
  }, [])

  const loadSales = async () => {
    try {
      const { data } = await api.get('/sales')
      setSales(data.sales)
    } catch (error) {
      console.error('Erro ao carregar vendas:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-3xl font-bold">Vendas</h1>

      <div className="rounded-lg bg-white shadow">
        <table className="w-full">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">#</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Data/Hora</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Operador</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Pagamento</th>
              <th className="px-6 py-3 text-right text-sm font-semibold">Total</th>
              <th className="px-6 py-3 text-center text-sm font-semibold">Status</th>
              <th className="px-6 py-3 text-center text-sm font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {sales.map((sale) => (
              <tr key={sale.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">#{sale.numero}</td>
                <td className="px-6 py-4 text-sm">{formatDateTime(sale.data)}</td>
                <td className="px-6 py-4 text-sm">{sale.user.nome}</td>
                <td className="px-6 py-4">
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                    {sale.formaPagamento}
                  </span>
                </td>
                <td className="px-6 py-4 text-right font-semibold text-green-600">
                  {formatCurrency(sale.total)}
                </td>
                <td className="px-6 py-4 text-center">
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-semibold ${
                      sale.status === 'CONCLUIDA'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {sale.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => setSelectedSale(sale)}
                    className="rounded p-2 text-blue-600 hover:bg-blue-50"
                  >
                    <Eye size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {sales.length === 0 && (
          <div className="py-12 text-center text-gray-500">
            Nenhuma venda registrada
          </div>
        )}
      </div>

      {/* Modal de Detalhes */}
      {selectedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-3xl rounded-lg bg-white p-6 shadow-2xl">
            <h2 className="mb-4 text-2xl font-bold">Detalhes da Venda #{selectedSale.numero}</h2>

            <div className="mb-6 grid grid-cols-3 gap-4 rounded bg-gray-50 p-4">
              <div>
                <p className="text-sm text-gray-600">Data/Hora</p>
                <p className="font-semibold">{formatDateTime(selectedSale.data)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Operador</p>
                <p className="font-semibold">{selectedSale.user.nome}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Pagamento</p>
                <p className="font-semibold">{selectedSale.formaPagamento}</p>
              </div>
            </div>

            <h3 className="mb-3 font-bold">Itens da Venda</h3>
            <table className="mb-4 w-full">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Produto</th>
                  <th className="px-4 py-2 text-right">Qtd</th>
                  <th className="px-4 py-2 text-right">Preço Unit.</th>
                  <th className="px-4 py-2 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {selectedSale.items.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2">{item.product.nome}</td>
                    <td className="px-4 py-2 text-right">{item.quantidade}</td>
                    <td className="px-4 py-2 text-right">{formatCurrency(item.precoUnitario)}</td>
                    <td className="px-4 py-2 text-right font-semibold">
                      {formatCurrency(item.subtotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2">
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-right font-bold">
                    TOTAL:
                  </td>
                  <td className="px-4 py-3 text-right text-lg font-bold text-green-600">
                    {formatCurrency(selectedSale.total)}
                  </td>
                </tr>
              </tfoot>
            </table>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedSale(null)}
                className="rounded bg-gray-500 px-6 py-2 text-white hover:bg-gray-600"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
