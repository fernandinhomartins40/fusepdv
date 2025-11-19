'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table'
import { Search, Edit, Trash2, Plus, Download, X } from 'lucide-react'

interface Product {
  id: string
  codigo: string
  ean?: string
  nome: string
  categoria?: string
  unidade: string
  precoCusto: number
  precoVenda: number
  estoque: number
  ativo: boolean
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editFormData, setEditFormData] = useState<Partial<Product>>({})
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: 'codigo',
      header: 'Código',
      cell: ({ row }) => <div className="font-medium">{row.getValue('codigo')}</div>,
    },
    {
      accessorKey: 'nome',
      header: 'Nome',
      cell: ({ row }) => <div className="max-w-xs truncate">{row.getValue('nome')}</div>,
    },
    {
      accessorKey: 'ean',
      header: 'EAN',
      cell: ({ row }) => <div className="text-sm text-gray-500">{row.getValue('ean') || '-'}</div>,
    },
    {
      accessorKey: 'categoria',
      header: 'Categoria',
      cell: ({ row }) => (
        <div className="text-sm">{row.getValue('categoria') || 'Sem categoria'}</div>
      ),
    },
    {
      accessorKey: 'precoCusto',
      header: 'Custo',
      cell: ({ row }) => (
        <div className="text-right">{formatCurrency(row.getValue('precoCusto'))}</div>
      ),
    },
    {
      accessorKey: 'precoVenda',
      header: 'Venda',
      cell: ({ row }) => (
        <div className="text-right font-semibold text-green-600">
          {formatCurrency(row.getValue('precoVenda'))}
        </div>
      ),
    },
    {
      accessorKey: 'estoque',
      header: 'Estoque',
      cell: ({ row }) => {
        const estoque = row.getValue('estoque') as number
        return (
          <div
            className={`text-right ${
              estoque <= 10 ? 'font-bold text-red-600' : 'text-gray-900'
            }`}
          >
            {estoque}
          </div>
        )
      },
    },
    {
      accessorKey: 'ativo',
      header: 'Status',
      cell: ({ row }) => {
        const ativo = row.getValue('ativo')
        return (
          <span
            className={`rounded-full px-2 py-1 text-xs font-semibold ${
              ativo
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {ativo ? 'Ativo' : 'Inativo'}
          </span>
        )
      },
    },
    {
      id: 'actions',
      header: 'Ações',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(row.original)}
            className="rounded p-1 text-blue-600 hover:bg-blue-50"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => handleDelete(row.original)}
            className="rounded p-1 text-red-600 hover:bg-red-50"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ]

  const table = useReactTable({
    data: products,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
  })

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const { data } = await api.get('/products?limit=1000')
      setProducts(data.products)
    } catch (error) {
      console.error('Erro ao carregar produtos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setEditFormData(product)
    setShowEditModal(true)
    setEditError(null)
  }

  const handleCloseEditModal = () => {
    setShowEditModal(false)
    setEditingProduct(null)
    setEditFormData({})
    setEditError(null)
  }

  const handleEditFormChange = (field: keyof Product, value: any) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSaveEdit = async () => {
    if (!editingProduct) return

    setEditLoading(true)
    setEditError(null)

    try {
      // Validate required fields
      if (!editFormData.codigo || !editFormData.nome || !editFormData.unidade) {
        setEditError('Código, Nome e Unidade são obrigatórios')
        setEditLoading(false)
        return
      }

      await api.put(`/products/${editingProduct.id}`, editFormData)

      // Update the products list
      await loadProducts()
      handleCloseEditModal()
    } catch (error) {
      console.error('Erro ao atualizar produto:', error)
      setEditError('Erro ao atualizar produto. Tente novamente.')
    } finally {
      setEditLoading(false)
    }
  }

  const handleDelete = async (product: Product) => {
    if (!confirm(`Deseja realmente excluir o produto "${product.nome}"?`)) return

    try {
      await api.delete(`/products/${product.id}`)
      loadProducts()
    } catch (error) {
      console.error('Erro ao excluir produto:', error)
      alert('Erro ao excluir produto')
    }
  }

  const exportToCSV = () => {
    const headers = ['Código', 'Nome', 'EAN', 'Categoria', 'Custo', 'Venda', 'Estoque', 'Status']
    const rows = products.map((p) => [
      p.codigo,
      p.nome,
      p.ean || '',
      p.categoria || '',
      p.precoCusto,
      p.precoVenda,
      p.estoque,
      p.ativo ? 'Ativo' : 'Inativo',
    ])

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'produtos.csv'
    a.click()
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
        <h1 className="text-3xl font-bold">Produtos</h1>
        <div className="flex gap-2">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
          >
            <Download size={20} />
            Exportar CSV
          </button>
          <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
            <Plus size={20} />
            Novo Produto
          </button>
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow">
        {/* Barra de Busca e Filtros */}
        <div className="mb-4 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={globalFilter ?? ''}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Buscar produtos..."
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <select
            onChange={(e) => {
              const value = e.target.value
              table.getColumn('ativo')?.setFilterValue(value === '' ? undefined : value === 'true')
            }}
            className="rounded-lg border border-gray-300 px-4 py-2"
          >
            <option value="">Todos</option>
            <option value="true">Ativos</option>
            <option value="false">Inativos</option>
          </select>
        </div>

        {/* Tabela */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-gray-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="px-4 py-3 text-left text-sm font-semibold">
                      {header.isPlaceholder ? null : (
                        <div
                          className={
                            header.column.getCanSort()
                              ? 'cursor-pointer select-none hover:text-blue-600'
                              : ''
                          }
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {{
                            asc: ' 🔼',
                            desc: ' 🔽',
                          }[header.column.getIsSorted() as string] ?? null}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y">
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 text-sm">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Mostrando {table.getRowModel().rows.length} de {products.length} produtos
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="rounded border px-3 py-1 disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="rounded border px-3 py-1 disabled:opacity-50"
            >
              Próxima
            </button>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-lg bg-white shadow-lg">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b p-6">
              <h2 className="text-xl font-bold">Editar Produto</h2>
              <button
                onClick={handleCloseEditModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-4 p-6">
              {editError && (
                <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
                  {editError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {/* Código */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Código <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editFormData.codigo || ''}
                    onChange={(e) => handleEditFormChange('codigo', e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* EAN */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    EAN
                  </label>
                  <input
                    type="text"
                    value={editFormData.ean || ''}
                    onChange={(e) => handleEditFormChange('ean', e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Nome */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Nome <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editFormData.nome || ''}
                    onChange={(e) => handleEditFormChange('nome', e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Categoria */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Categoria
                  </label>
                  <input
                    type="text"
                    value={editFormData.categoria || ''}
                    onChange={(e) => handleEditFormChange('categoria', e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Unidade */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Unidade <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editFormData.unidade || ''}
                    onChange={(e) => handleEditFormChange('unidade', e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Preço Custo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Preço Custo
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editFormData.precoCusto || ''}
                    onChange={(e) =>
                      handleEditFormChange('precoCusto', parseFloat(e.target.value) || 0)
                    }
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Preço Venda */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Preço Venda
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editFormData.precoVenda || ''}
                    onChange={(e) =>
                      handleEditFormChange('precoVenda', parseFloat(e.target.value) || 0)
                    }
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Estoque */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Estoque
                  </label>
                  <input
                    type="number"
                    value={editFormData.estoque || ''}
                    onChange={(e) => handleEditFormChange('estoque', parseInt(e.target.value) || 0)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Ativo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    value={editFormData.ativo ? 'true' : 'false'}
                    onChange={(e) => handleEditFormChange('ativo', e.target.value === 'true')}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="true">Ativo</option>
                    <option value="false">Inativo</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 border-t p-6">
              <button
                onClick={handleCloseEditModal}
                disabled={editLoading}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={editLoading}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {editLoading ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
