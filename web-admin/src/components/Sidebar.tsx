'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FileText,
  Users,
  Settings,
  LogOut,
  TrendingUp,
} from 'lucide-react'

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/products', label: 'Produtos', icon: Package },
    { href: '/sales', label: 'Vendas', icon: ShoppingCart },
    { href: '/reports', label: 'Relatórios', icon: TrendingUp },
    { href: '/nfe', label: 'NF-e Importadas', icon: FileText },
    { href: '/users', label: 'Usuários', icon: Users },
    { href: '/settings', label: 'Configurações', icon: Settings },
  ]

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    router.push('/login')
  }

  return (
    <div className="flex h-screen w-64 flex-col bg-gray-900 text-white">
      <div className="p-6">
        <h1 className="text-2xl font-bold">PDV Admin</h1>
        <p className="text-sm text-gray-400">Painel Administrativo</p>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-gray-800 p-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
        >
          <LogOut size={20} />
          <span>Sair</span>
        </button>
      </div>
    </div>
  )
}
