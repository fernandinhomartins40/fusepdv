import { useEffect } from 'react'
import { useAuthStore } from './store/useAuthStore'
import LoginPage from './pages/Login Page'
import POSPage from './pages/POSPage'
import './styles/globals.css'

function App() {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginPage />
  }

  return <POSPage />
}

export default App
