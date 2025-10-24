import { useCartStore } from '../store/useCartStore'
import { Trash2 } from 'lucide-react'

export default function CartView() {
  const { items, removeItem, updateQuantity } = useCartStore()

  if (items.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-gray-400">
        <p className="text-lg">Carrinho vazio. Escaneie um produto para começar.</p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <table className="w-full">
        <thead className="sticky top-0 bg-gray-100">
          <tr className="border-b-2">
            <th className="p-2 text-left">Produto</th>
            <th className="p-2 text-center">Qtd</th>
            <th className="p-2 text-right">Preço Unit.</th>
            <th className="p-2 text-right">Subtotal</th>
            <th className="p-2"></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.productId} className="border-b">
              <td className="p-2">
                <div className="font-semibold">{item.nome}</div>
                <div className="text-sm text-gray-500">
                  Cód: {item.codigo} | Un: {item.unidade}
                </div>
              </td>
              <td className="p-2">
                <input
                  type="number"
                  value={item.quantidade}
                  onChange={(e) => updateQuantity(item.productId, Number(e.target.value))}
                  className="w-16 rounded border px-2 py-1 text-center"
                  min="1"
                />
              </td>
              <td className="p-2 text-right">R$ {item.precoUnitario.toFixed(2)}</td>
              <td className="p-2 text-right font-semibold">
                R$ {item.subtotal.toFixed(2)}
              </td>
              <td className="p-2">
                <button
                  onClick={() => removeItem(item.productId)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 size={20} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
