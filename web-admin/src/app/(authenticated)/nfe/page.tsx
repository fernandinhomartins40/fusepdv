'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { Download, FileText } from 'lucide-react'

interface NfeImport {
  id: string
  chaveAcesso: string
  numero: string
  serie: string
  fornecedorCnpj: string
  fornecedorNome: string
  dataEmissao: string
  valorTotal: number
  produtosCount: number
  createdAt: string
}

export default function NFePage() {
  const [imports, setImports] = useState<NfeImport[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImport, setSelectedImport] = useState<NfeImport | null>(null)

  useEffect(() => {
    loadImports()
  }, [])

  const loadImports = async () => {
    try {
      const { data } = await api.get('/nfe/history')
      setImports(data.imports)
    } catch (error) {
      console.error('Erro ao carregar importações:', error)
    } finally {
      setLoading(false)
    }
  }

  const downloadXML = async (id: string, numero: string) => {
    try {
      const { data } = await api.get(`/nfe/${id}/xml`, {
        responseType: 'blob',
      })

      const blob = new Blob([data], { type: 'application/xml' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `nfe-${numero}.xml`
      a.click()
    } catch (error) {
      console.error('Erro ao baixar XML:', error)
      alert('Erro ao baixar XML')
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
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">NF-e Importadas</h1>
        <div className="text-sm text-gray-600">
          Total: {imports.length} importações
        </div>
      </div>

      <div className="rounded-lg bg-white shadow">
        <table className="w-full">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Data Importação</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Número</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Fornecedor</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">CNPJ</th>
              <th className="px-6 py-3 text-right text-sm font-semibold">Valor Total</th>
              <th className="px-6 py-3 text-center text-sm font-semibold">Produtos</th>
              <th className="px-6 py-3 text-center text-sm font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {imports.map((nfe) => (
              <tr key={nfe.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm">{formatDateTime(nfe.createdAt)}</td>
                <td className="px-6 py-4">
                  <div className="font-medium">{nfe.numero}</div>
                  <div className="text-xs text-gray-500">Série: {nfe.serie}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium">{nfe.fornecedorNome}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{nfe.fornecedorCnpj}</td>
                <td className="px-6 py-4 text-right font-semibold">
                  {formatCurrency(nfe.valorTotal)}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                    {nfe.produtosCount}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => setSelectedImport(nfe)}
                      className="rounded p-2 text-blue-600 hover:bg-blue-50"
                      title="Ver detalhes"
                    >
                      <FileText size={18} />
                    </button>
                    <button
                      onClick={() => downloadXML(nfe.id, nfe.numero)}
                      className="rounded p-2 text-green-600 hover:bg-green-50"
                      title="Baixar XML"
                    >
                      <Download size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {imports.length === 0 && (
          <div className="py-12 text-center text-gray-500">
            <FileText size={48} className="mx-auto mb-4 text-gray-400" />
            <p>Nenhuma NF-e importada ainda</p>
          </div>
        )}
      </div>

      {/* Modal de Detalhes */}
      {selectedImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-2xl">
            <h2 className="mb-4 text-2xl font-bold">Detalhes da NF-e</h2>

            <div className="mb-6 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Número</p>
                <p className="font-semibold">{selectedImport.numero}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Série</p>
                <p className="font-semibold">{selectedImport.serie}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Fornecedor</p>
                <p className="font-semibold">{selectedImport.fornecedorNome}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">CNPJ</p>
                <p className="font-semibold">{selectedImport.fornecedorCnpj}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Valor Total</p>
                <p className="font-semibold text-green-600">
                  {formatCurrency(selectedImport.valorTotal)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Produtos Importados</p>
                <p className="font-semibold">{selectedImport.produtosCount}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-600">Chave de Acesso</p>
                <p className="font-mono text-xs">{selectedImport.chaveAcesso}</p>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => downloadXML(selectedImport.id, selectedImport.numero)}
                className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
              >
                Baixar XML
              </button>
              <button
                onClick={() => setSelectedImport(null)}
                className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
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
