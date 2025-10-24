'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { Plus, Edit, Trash2 } from 'lucide-react'

interface User {
  id: string
  nome: string
  email: string
  role: string
  ativo: boolean
  createdAt: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    role: 'OPERADOR',
  })

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const { data } = await api.get('/establishment/users')
      setUsers(data)
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingUser) {
        await api.patch(`/establishment/users/${editingUser.id}`, formData)
      } else {
        await api.post('/establishment/users', formData)
      }

      setShowModal(false)
      setFormData({ nome: '', email: '', senha: '', role: 'OPERADOR' })
      setEditingUser(null)
      loadUsers()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao salvar usuário')
    }
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setFormData({
      nome: user.nome,
      email: user.email,
      senha: '',
      role: user.role,
    })
    setShowModal(true)
  }

  const handleDeactivate = async (user: User) => {
    if (!confirm(`Deseja desativar o usuário "${user.nome}"?`)) return

    try {
      await api.delete(`/establishment/users/${user.id}`)
      loadUsers()
    } catch (error) {
      alert('Erro ao desativar usuário')
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
        <h1 className="text-3xl font-bold">Gestão de Usuários</h1>
        <button
          onClick={() => {
            setEditingUser(null)
            setFormData({ nome: '', email: '', senha: '', role: 'OPERADOR' })
            setShowModal(true)
          }}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          <Plus size={20} />
          Novo Usuário
        </button>
      </div>

      <div className="rounded-lg bg-white shadow">
        <table className="w-full">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Nome</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Perfil</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
              <th className="px-6 py-3 text-center text-sm font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">{user.nome}</td>
                <td className="px-6 py-4 text-gray-600">{user.email}</td>
                <td className="px-6 py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-semibold ${
                      user.role === 'ADMIN'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {user.role === 'ADMIN' ? 'Administrador' : 'Operador'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-semibold ${
                      user.ativo
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {user.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => handleEdit(user)}
                      className="rounded p-2 text-blue-600 hover:bg-blue-50"
                    >
                      <Edit size={18} />
                    </button>
                    {user.ativo && (
                      <button
                        onClick={() => handleDeactivate(user)}
                        className="rounded p-2 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Criar/Editar */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-2xl">
            <h2 className="mb-4 text-2xl font-bold">
              {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Nome</label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="mt-1 w-full rounded border px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1 w-full rounded border px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium">
                  Senha {editingUser && '(deixe em branco para não alterar)'}
                </label>
                <input
                  type="password"
                  value={formData.senha}
                  onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                  className="mt-1 w-full rounded border px-3 py-2"
                  required={!editingUser}
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Perfil</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="mt-1 w-full rounded border px-3 py-2"
                >
                  <option value="OPERADOR">Operador</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingUser(null)
                  }}
                  className="flex-1 rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
