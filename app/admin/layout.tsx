'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LogOut, Calendar, Users, BarChart3, Settings, Bell } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    checkAuth()
  }, [pathname])

  const checkAuth = () => {
    const auth = localStorage.getItem('admin-auth')
    const loginTime = localStorage.getItem('admin-login-time')
    
    if (auth === 'true' && loginTime) {
      // Verificar si la sesión no ha expirado (24 horas)
      const loginTimestamp = parseInt(loginTime)
      const now = new Date().getTime()
      const hoursPassed = (now - loginTimestamp) / (1000 * 60 * 60)
      
      if (hoursPassed < 24) {
        setIsAuthenticated(true)
      } else {
        // Sesión expirada
        handleLogout()
        return
      }
    }
    
    setIsLoading(false)
  }

  // Efecto separado para redirecciones
  useEffect(() => {
    const auth = localStorage.getItem('admin-auth')
    
    if (!auth && pathname !== '/admin/login' && !isLoading) {
      router.push('/admin/login')
    }
  }, [isAuthenticated, pathname, isLoading, router])

  const handleLogout = () => {
    localStorage.removeItem('admin-auth')
    localStorage.removeItem('admin-login-time')
    router.push('/admin/login')
  }

  // Si está en la página de login, no mostrar el layout de admin
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  // Mostrar loading mientras verifica autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Verificando acceso...</p>
        </div>
      </div>
    )
  }

  // Si no está autenticado, mostrar mensaje de carga
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Redirigiendo...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Image 
                src="/images/monnas-logo2.png" 
                alt="Monnas Logo" 
                width={32} 
                height={32} 
                className="rounded-full"
              />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Panel de Administración</h1>
                <p className="text-sm text-gray-500">Monnas Estética</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Administrador
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <Link
              href="/admin"
              className={`flex items-center px-3 py-4 text-sm font-medium transition-colors ${
                pathname === '/admin'
                  ? 'text-pink-600 border-b-2 border-pink-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard
            </Link>
            
            <Link
              href="/admin/reservations"
              className={`flex items-center px-3 py-4 text-sm font-medium transition-colors ${
                pathname === '/admin/reservations'
                  ? 'text-pink-600 border-b-2 border-pink-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Reservas
            </Link>

            <Link
              href="/admin/calendar"
              className={`flex items-center px-3 py-4 text-sm font-medium transition-colors ${
                pathname === '/admin/calendar'
                  ? 'text-pink-600 border-b-2 border-pink-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Calendario
            </Link>

            <Link
              href="/admin/notifications"
              className={`flex items-center px-3 py-4 text-sm font-medium transition-colors ${
                pathname === '/admin/notifications'
                  ? 'text-pink-600 border-b-2 border-pink-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Bell className="h-4 w-4 mr-2" />
              Notificaciones
            </Link>

            <Link
              href="/admin/clients"
              className={`flex items-center px-3 py-4 text-sm font-medium transition-colors ${
                pathname === '/admin/clients'
                  ? 'text-pink-600 border-b-2 border-pink-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Users className="h-4 w-4 mr-2" />
              Clientes
            </Link>

            <Link
              href="/"
              target="_blank"
              className="flex items-center px-3 py-4 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
            >
              Ver Página Principal ↗
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}