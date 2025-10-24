'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import {
  TrendingUp,
  Package,
  ShoppingCart,
  AlertTriangle,
  DollarSign,
} from 'lucide-react'

interface Stats {
  totalProdutos: number
  totalVendas: number
  vendasHoje: {
    quantidade: number
    valor: number
  }
  produtosEstoqueBaixo: number
  totalUsuarios: number
}

interface SalesReport {
  totalVendas: number
  valorTotal: number
  ticketMedio: number
  vendasPorDia: Array<{ data: string; quantidade: number; valor: number }>
  vendasPorFormaPagamento: Array<{ formaPagamento: string; quantidade: number; valor: number }>
  produtosMaisVendidos: Array<{ productId: string; nome: string; quantidade: number; valor: number }>
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [report, setReport] = useState<SalesReport | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [statsRes, reportRes] = await Promise.all([
        api.get('/establishment/stats'),
        api.get('/sales/report/summary'),
      ])

      setStats(statsRes.data)
      setReport(reportRes.data)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
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
      <h1 className="mb-6 text-3xl font-bold">Dashboard</h1>

      {/* Cards de Métricas */}
      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Vendas Hoje</p>
              <p className="text-2xl font-bold">{stats?.vendasHoje.quantidade || 0}</p>
              <p className="text-sm text-green-600">
                {formatCurrency(stats?.vendasHoje.valor || 0)}
              </p>
            </div>
            <div className="rounded-full bg-green-100 p-3">
              <ShoppingCart className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Vendas</p>
              <p className="text-2xl font-bold">{stats?.totalVendas || 0}</p>
              <p className="text-sm text-blue-600">
                Valor: {formatCurrency(report?.valorTotal || 0)}
              </p>
            </div>
            <div className="rounded-full bg-blue-100 p-3">
              <TrendingUp className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Produtos Cadastrados</p>
              <p className="text-2xl font-bold">{stats?.totalProdutos || 0}</p>
              <p className="text-sm text-gray-500">Ativos</p>
            </div>
            <div className="rounded-full bg-purple-100 p-3">
              <Package className="text-purple-600" size={24} />
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Estoque Baixo</p>
              <p className="text-2xl font-bold">{stats?.produtosEstoqueBaixo || 0}</p>
              <p className="text-sm text-orange-600">Produtos</p>
            </div>
            <div className="rounded-full bg-orange-100 p-3">
              <AlertTriangle className="text-orange-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Gráfico de Vendas por Dia */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-bold">Vendas por Dia</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={report?.vendasPorDia || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="data"
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return `${date.getDate()}/${date.getMonth() + 1}`
                }}
              />
              <YAxis />
              <Tooltip
                labelFormatter={(value) => formatDate(value)}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="valor"
                stroke="#8884d8"
                name="Valor"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Formas de Pagamento */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-bold">Vendas por Forma de Pagamento</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={report?.vendasPorFormaPagamento || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => entry.formaPagamento}
                outerRadius={80}
                fill="#8884d8"
                dataKey="valor"
              >
                {report?.vendasPorFormaPagamento.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top 10 Produtos Mais Vendidos */}
        <div className="rounded-lg bg-white p-6 shadow lg:col-span-2">
          <h2 className="mb-4 text-xl font-bold">Top 10 Produtos Mais Vendidos</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={report?.produtosMaisVendidos.slice(0, 10) || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nome" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip formatter={(value: number) => value} />
              <Legend />
              <Bar dataKey="quantidade" fill="#8884d8" name="Quantidade" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Métricas Adicionais */}
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-green-100 p-3">
              <DollarSign className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Ticket Médio</p>
              <p className="text-2xl font-bold">
                {formatCurrency(report?.ticketMedio || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-blue-100 p-3">
              <ShoppingCart className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total de Vendas</p>
              <p className="text-2xl font-bold">{report?.totalVendas || 0}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-purple-100 p-3">
              <Package className="text-purple-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Valor Total</p>
              <p className="text-2xl font-bold">
                {formatCurrency(report?.valorTotal || 0)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
