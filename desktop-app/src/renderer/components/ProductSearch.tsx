import { useState } from 'react'
import api from '../lib/api'
import { Search } from 'lucide-react'

interface ProductSearchProps {
  onSelectProduct: (product: any) => void
}

export default function ProductSearch({ onSelectProduct }: ProductSearchProps) {
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const handleSearch = async () => {
    if (!search.trim()) return

    setLoading(true)
    try {
      const { data } = await api.get(`/products?search=${search}&limit=10`)
      setResults(data.products)
      setShowResults(true)
    } catch (error) {
      console.error('Erro ao buscar produtos:', error)
    } finally {
      setLoading(false)
    }
  }

  const selectProduct = (product: any) => {
    onSelectProduct(product)
    setSearch('')
    setResults([])
    setShowResults(false)
  }

  return (
    <div className="relative mb-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Buscar produto por nome ou código..."
          className="flex-1 rounded border px-3 py-2"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          <Search size={20} />
        </button>
      </div>

      {showResults && results.length > 0 && (
        <div className="absolute z-10 mt-2 w-full rounded border bg-white shadow-lg">
          {results.map((product) => (
            <div
              key={product.id}
              onClick={() => selectProduct(product)}
              className="cursor-pointer border-b p-3 hover:bg-gray-100"
            >
              <div className="font-semibold">{product.nome}</div>
              <div className="text-sm text-gray-600">
                Cód: {product.codigo} | R$ {product.precoVenda.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
