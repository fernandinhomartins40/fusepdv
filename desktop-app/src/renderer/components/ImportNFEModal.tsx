import { useState } from 'react'
import api from '../lib/api'

interface ImportNFEModalProps {
  onClose: () => void
}

interface ParsedProduct {
  codigo: string
  ean?: string
  nome: string
  unidade: string
  quantidade: number
  precoUnitario: number
  valorTotal: number
  ncm?: string
  cfop?: string
  // Campos editáveis
  selected: boolean
  precoVenda: number
  categoria: string
  estoqueInicial: number
}

export default function ImportNFEModal({ onClose }: ImportNFEModalProps) {
  const [xmlContent, setXmlContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [parsedData, setParsedData] = useState<any>(null)
  const [products, setProducts] = useState<ParsedProduct[]>([])
  const [step, setStep] = useState<'upload' | 'review'>('upload')
  const [margemLucro, setMargemLucro] = useState(30) // 30% padrão

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const xml = event.target?.result as string
      setXmlContent(xml)
    }
    reader.readAsText(file)
  }

  const handleParse = async () => {
    if (!xmlContent.trim()) {
      alert('Cole ou selecione um arquivo XML')
      return
    }

    setLoading(true)

    try {
      const { data } = await api.post('/nfe/parse', { xmlContent })

      if (data.success) {
        setParsedData(data)

        // Transformar produtos para edição
        const editableProducts: ParsedProduct[] = data.produtos.map((p: any) => ({
          ...p,
          selected: true,
          precoVenda: p.precoUnitario * (1 + margemLucro / 100),
          categoria: '',
          estoqueInicial: p.quantidade,
        }))

        setProducts(editableProducts)
        setStep('review')
      } else {
        alert('Erro ao parsear XML: ' + data.error)
      }
    } catch (error: any) {
      alert('Erro ao processar NF-e: ' + (error.response?.data?.details || error.message))
    } finally {
      setLoading(false)
    }
  }

  const handleImport = async () => {
    const selectedProducts = products.filter((p) => p.selected)

    if (selectedProducts.length === 0) {
      alert('Selecione pelo menos um produto')
      return
    }

    setLoading(true)

    try {
      // Preparar produtos para envio
      const productsToImport = selectedProducts.map((p) => ({
        codigo: p.codigo,
        ean: p.ean,
        nome: p.nome,
        descricao: p.nome,
        categoria: p.categoria || 'Sem Categoria',
        unidade: p.unidade,
        precoCusto: p.precoUnitario,
        precoVenda: p.precoVenda,
        estoque: p.estoqueInicial,
        ncm: p.ncm,
        cfop: p.cfop,
        ativo: true,
      }))

      const { data } = await api.post('/products/bulk', {
        products: productsToImport,
      })

      alert(
        `Importação concluída!\n` +
        `✅ ${data.success.length} produtos importados\n` +
        `❌ ${data.errors.length} erros`
      )

      if (data.errors.length > 0) {
        console.error('Erros na importação:', data.errors)
      }

      onClose()
    } catch (error: any) {
      alert('Erro ao importar produtos: ' + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  const toggleProduct = (index: number) => {
    setProducts((prev) =>
      prev.map((p, i) => (i === index ? { ...p, selected: !p.selected } : p))
    )
  }

  const updateProduct = (index: number, field: string, value: any) => {
    setProducts((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p))
    )
  }

  const aplicarMargem = () => {
    setProducts((prev) =>
      prev.map((p) => ({
        ...p,
        precoVenda: p.precoUnitario * (1 + margemLucro / 100),
      }))
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="max-h-[90vh] w-full max-w-6xl overflow-hidden rounded-lg bg-white shadow-2xl">
        {/* Header */}
        <div className="border-b bg-blue-600 px-6 py-4 text-white">
          <h2 className="text-2xl font-bold">Importar Nota Fiscal Eletrônica (NF-e)</h2>
          <p className="text-sm opacity-90">
            Extraia produtos automaticamente do XML da NF-e
          </p>
        </div>

        {/* Content */}
        <div className="max-h-[70vh] overflow-y-auto p-6">
          {step === 'upload' ? (
            <div>
              <div className="mb-4">
                <label className="mb-2 block font-semibold">1. Selecione o arquivo XML:</label>
                <input
                  type="file"
                  accept=".xml"
                  onChange={handleFileSelect}
                  className="w-full rounded border p-2"
                />
              </div>

              <div className="mb-4">
                <label className="mb-2 block font-semibold">2. Ou cole o conteúdo do XML:</label>
                <textarea
                  value={xmlContent}
                  onChange={(e) => setXmlContent(e.target.value)}
                  rows={10}
                  className="w-full rounded border p-2 font-mono text-sm"
                  placeholder="Cole o conteúdo XML aqui..."
                />
              </div>

              <button
                onClick={handleParse}
                disabled={loading || !xmlContent.trim()}
                className="w-full rounded bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Processando...' : 'Processar NF-e'}
              </button>
            </div>
          ) : (
            <div>
              {/* Informações da NF-e */}
              {parsedData && (
                <div className="mb-6 rounded bg-gray-100 p-4">
                  <h3 className="mb-2 font-bold">Informações da NF-e:</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Fornecedor:</strong> {parsedData.fornecedor.nome}
                    </div>
                    <div>
                      <strong>CNPJ:</strong> {parsedData.fornecedor.cnpj}
                    </div>
                    <div>
                      <strong>Número:</strong> {parsedData.info.numero}
                    </div>
                    <div>
                      <strong>Total de Produtos:</strong> {parsedData.totalProdutos}
                    </div>
                  </div>
                </div>
              )}

              {/* Controles */}
              <div className="mb-4 flex items-center gap-4">
                <div>
                  <label className="mr-2 font-semibold">Margem de Lucro (%):</label>
                  <input
                    type="number"
                    value={margemLucro}
                    onChange={(e) => setMargemLucro(Number(e.target.value))}
                    className="w-20 rounded border px-2 py-1"
                    min="0"
                    max="200"
                  />
                </div>
                <button
                  onClick={aplicarMargem}
                  className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                >
                  Aplicar Margem
                </button>
                <div className="ml-auto text-sm text-gray-600">
                  {products.filter((p) => p.selected).length} de {products.length} selecionados
                </div>
              </div>

              {/* Tabela de Produtos */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="p-2">
                        <input
                          type="checkbox"
                          checked={products.every((p) => p.selected)}
                          onChange={(e) =>
                            setProducts((prev) =>
                              prev.map((p) => ({ ...p, selected: e.target.checked }))
                            )
                          }
                        />
                      </th>
                      <th className="p-2 text-left">Código</th>
                      <th className="p-2 text-left">Nome</th>
                      <th className="p-2 text-left">Un</th>
                      <th className="p-2 text-right">Custo</th>
                      <th className="p-2 text-right">Venda</th>
                      <th className="p-2 text-left">Categoria</th>
                      <th className="p-2 text-right">Estoque</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product, index) => (
                      <tr
                        key={index}
                        className={product.selected ? 'bg-white' : 'bg-gray-100 opacity-50'}
                      >
                        <td className="p-2">
                          <input
                            type="checkbox"
                            checked={product.selected}
                            onChange={() => toggleProduct(index)}
                          />
                        </td>
                        <td className="p-2">{product.codigo}</td>
                        <td className="p-2">{product.nome}</td>
                        <td className="p-2">{product.unidade}</td>
                        <td className="p-2 text-right">
                          R$ {product.precoUnitario.toFixed(2)}
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            value={product.precoVenda}
                            onChange={(e) =>
                              updateProduct(index, 'precoVenda', Number(e.target.value))
                            }
                            className="w-24 rounded border px-2 py-1 text-right"
                            step="0.01"
                            disabled={!product.selected}
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={product.categoria}
                            onChange={(e) => updateProduct(index, 'categoria', e.target.value)}
                            className="w-32 rounded border px-2 py-1"
                            placeholder="Categoria"
                            disabled={!product.selected}
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            value={product.estoqueInicial}
                            onChange={(e) =>
                              updateProduct(index, 'estoqueInicial', Number(e.target.value))
                            }
                            className="w-20 rounded border px-2 py-1 text-right"
                            disabled={!product.selected}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t bg-gray-50 px-6 py-4">
          {step === 'review' && (
            <button
              onClick={() => setStep('upload')}
              className="rounded bg-gray-500 px-6 py-2 text-white hover:bg-gray-600"
            >
              Voltar
            </button>
          )}
          <button
            onClick={onClose}
            className="rounded bg-gray-500 px-6 py-2 text-white hover:bg-gray-600"
          >
            Cancelar
          </button>
          {step === 'review' && (
            <button
              onClick={handleImport}
              disabled={loading || products.filter((p) => p.selected).length === 0}
              className="rounded bg-green-600 px-6 py-2 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Importando...' : 'Importar Selecionados'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
