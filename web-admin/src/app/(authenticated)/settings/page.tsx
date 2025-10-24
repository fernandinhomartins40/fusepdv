'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { Save } from 'lucide-react'

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [establishment, setEstablishment] = useState<any>(null)
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
  })

  useEffect(() => {
    loadEstablishment()
  }, [])

  const loadEstablishment = async () => {
    try {
      const { data } = await api.get('/establishment')
      setEstablishment(data)
      setFormData({
        nome: data.nome || '',
        telefone: data.telefone || '',
        endereco: data.endereco || '',
        cidade: data.cidade || '',
        estado: data.estado || '',
        cep: data.cep || '',
      })
    } catch (error) {
      console.error('Erro ao carregar estabelecimento:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      await api.patch('/establishment', formData)
      alert('Configurações salvas com sucesso!')
      loadEstablishment()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao salvar configurações')
    } finally {
      setSaving(false)
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
      <h1 className="mb-6 text-3xl font-bold">Configurações</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Dados do Estabelecimento */}
        <div className="lg:col-span-2">
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-bold">Dados do Estabelecimento</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium">Nome do Estabelecimento</label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="mt-1 w-full rounded border px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium">CNPJ</label>
                  <input
                    type="text"
                    value={establishment?.cnpj || ''}
                    className="mt-1 w-full rounded border bg-gray-50 px-3 py-2"
                    disabled
                  />
                  <p className="mt-1 text-xs text-gray-500">O CNPJ não pode ser alterado</p>
                </div>

                <div>
                  <label className="block text-sm font-medium">Telefone</label>
                  <input
                    type="text"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    className="mt-1 w-full rounded border px-3 py-2"
                    placeholder="(00) 00000-0000"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium">Endereço</label>
                  <input
                    type="text"
                    value={formData.endereco}
                    onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                    className="mt-1 w-full rounded border px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium">Cidade</label>
                  <input
                    type="text"
                    value={formData.cidade}
                    onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                    className="mt-1 w-full rounded border px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium">Estado</label>
                  <input
                    type="text"
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                    className="mt-1 w-full rounded border px-3 py-2"
                    maxLength={2}
                    placeholder="SP"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium">CEP</label>
                  <input
                    type="text"
                    value={formData.cep}
                    onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                    className="mt-1 w-full rounded border px-3 py-2"
                    placeholder="00000-000"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                <Save size={20} />
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </form>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="space-y-6">
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-bold">Estatísticas</h2>
            <div className="space-y-3">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Produtos Cadastrados</span>
                <span className="font-bold">{establishment?._count?.products || 0}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Total de Vendas</span>
                <span className="font-bold">{establishment?._count?.sales || 0}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Usuários Ativos</span>
                <span className="font-bold">{establishment?._count?.users || 0}</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-blue-50 p-6">
            <h3 className="mb-2 font-semibold text-blue-900">Informações</h3>
            <p className="text-sm text-blue-800">
              Para alterar configurações avançadas ou dados fiscais, entre em contato com o suporte.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
