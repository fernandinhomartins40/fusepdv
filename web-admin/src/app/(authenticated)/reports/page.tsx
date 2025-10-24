'use client'

import { useState } from 'react'
import api from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Download, Calendar } from 'lucide-react'

export default function ReportsPage() {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [report, setReport] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const generateReport = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)

      const { data } = await api.get(`/sales/report/summary?${params}`)
      setReport(data)
    } catch (error) {
      console.error('Erro ao gerar relatório:', error)
      alert('Erro ao gerar relatório')
    } finally {
      setLoading(false)
    }
  }

  const exportReport = () => {
    if (!report) return

    const content = `
RELATÓRIO DE VENDAS
Período: ${startDate || 'Início'} até ${endDate || 'Hoje'}

RESUMO
Total de Vendas: ${report.totalVendas}
Valor Total: ${formatCurrency(report.valorTotal)}
Ticket Médio: ${formatCurrency(report.ticketMedio)}

VENDAS POR DIA
${report.vendasPorDia.map((v: any) => `${formatDate(v.data)}: ${v.quantidade} vendas - ${formatCurrency(v.valor)}`).join('\n')}

VENDAS POR FORMA DE PAGAMENTO
${report.vendasPorFormaPagamento.map((v: any) => `${v.formaPagamento}: ${v.quantidade} vendas - ${formatCurrency(v.valor)}`).join('\n')}

PRODUTOS MAIS VENDIDOS
${report.produtosMaisVendidos.map((p: any, i: number) => `${i + 1}. ${p.nome}: ${p.quantidade} un - ${formatCurrency(p.valor)}`).join('\n')}
    `

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `relatorio-vendas-${Date.now()}.txt`
    a.click()
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-3xl font-bold">Relatórios de Vendas</h1>

      {/* Filtros */}
      <div className="mb-6 rounded-lg bg-white p-6 shadow">
        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium">Data Inicial</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded border px-3 py-2"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Data Final</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded border px-3 py-2"
            />
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={generateReport}
              disabled={loading}
              className="flex-1 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Gerando...' : 'Gerar Relatório'}
            </button>
            {report && (
              <button
                onClick={exportReport}
                className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
              >
                <Download size={20} />
              </button>
            )}
          </div>
        </div>
      </div>

      {report && (
        <>
          {/* Cards Resumo */}
          <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-lg bg-white p-6 shadow">
              <p className="text-sm text-gray-600">Total de Vendas</p>
              <p className="text-3xl font-bold">{report.totalVendas}</p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow">
              <p className="text-sm text-gray-600">Valor Total</p>
              <p className="text-3xl font-bold text-green-600">
                {formatCurrency(report.valorTotal)}
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow">
              <p className="text-sm text-gray-600">Ticket Médio</p>
              <p className="text-3xl font-bold text-blue-600">
                {formatCurrency(report.ticketMedio)}
              </p>
            </div>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-xl font-bold">Vendas por Dia</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={report.vendasPorDia}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="data"
                    tickFormatter={(value) => {
                      const date = new Date(value)
                      return `${date.getDate()}/${date.getMonth() + 1}`
                    }}
                  />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip labelFormatter={(value) => formatDate(value)} />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="quantidade" stroke="#8884d8" name="Quantidade" />
                  <Line yAxisId="right" type="monotone" dataKey="valor" stroke="#82ca9d" name="Valor" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-xl font-bold">Vendas por Forma de Pagamento</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={report.vendasPorFormaPagamento}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="formaPagamento" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="valor" fill="#8884d8" name="Valor" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tabela de Produtos Mais Vendidos */}
          <div className="mt-6 rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-bold">Produtos Mais Vendidos</h2>
            <table className="w-full">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">#</th>
                  <th className="px-4 py-2 text-left">Produto</th>
                  <th className="px-4 py-2 text-right">Quantidade</th>
                  <th className="px-4 py-2 text-right">Valor Total</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {report.produtosMaisVendidos.map((produto: any, index: number) => (
                  <tr key={produto.productId} className="hover:bg-gray-50">
                    <td className="px-4 py-2">{index + 1}</td>
                    <td className="px-4 py-2 font-medium">{produto.nome}</td>
                    <td className="px-4 py-2 text-right">{produto.quantidade}</td>
                    <td className="px-4 py-2 text-right font-semibold text-green-600">
                      {formatCurrency(produto.valor)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
