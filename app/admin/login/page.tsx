'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Lock, Eye, EyeOff } from 'lucide-react'
import Image from 'next/image'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async () => {
    setIsLoading(true)
    setError('')

    // Simulamos un pequeño delay para mejor UX
    await new Promise(resolve => setTimeout(resolve, 1000))

    // En producción, esto debería ser una variable de entorno
    const ADMIN_PASSWORD = 'monnas2024'

    if (password === ADMIN_PASSWORD) {
      // Guardar autenticación en localStorage
      localStorage.setItem('admin-auth', 'true')
      localStorage.setItem('admin-login-time', new Date().getTime().toString())
      
      // Redirigir al dashboard
      router.push('/admin')
    } else {
      setError('Contraseña incorrecta. Intenta nuevamente.')
    }

    setIsLoading(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center">
              <Image 
                src="/images/monnas-logo2.png" 
                alt="Monnas Logo" 
                width={40} 
                height={40} 
                className="rounded-full"
              />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Panel de Administración
          </CardTitle>
          <CardDescription className="text-gray-600">
            Acceso exclusivo para administradores de Monnas
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Contraseña de Administrador
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pr-10"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-600 flex items-center">
                  <Lock className="h-4 w-4 mr-2" />
                  {error}
                </p>
              </div>
            )}

            <Button 
              onClick={handleLogin} 
              disabled={isLoading || !password}
              className="w-full bg-pink-500 hover:bg-pink-600 text-white"
            >
              {isLoading ? 'Verificando...' : 'Ingresar al Panel'}
            </Button>
          </div>

          <div className="text-center">
            <button
              onClick={() => router.push('/')}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              ← Volver a la página principal
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}