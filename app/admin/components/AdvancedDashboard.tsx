'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Calendar,
  Clock,
  Users,
  Star,
  Activity,
  BarChart3,
  PieChart,
  Target,
  Award
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import ChartsDashboard from './ChartsDashboard'

interface Reservation {
  id: string
  client_name: string
  client_email: string
  client_phone: string
  selected_date: string
  selected_time: string
  selected_services: string[]
  comments: string
  status: string
  created_at: string
}

interface DashboardStats {
  totalReservations: number
  todayReservations: number
  weekReservations: number
  monthReservations: number
  confirmedRate: number
  popularServices: { name: string; count: number; percentage: number }[]
  busyHours: { hour: string; count: number }[]
  weeklyTrend: { day: string; count: number }[]
  monthlyRevenue: number
  averageDaily: number
  topClients: { name: string; count: number; phone: string }[]
}

const serviceNames = {
  "cosmetologia": "Cosmetología",
  "cejas-pestanas": "Cejas & Pestañas", 
  "tricologia": "Tricología Facial",
  "depilacion-laser": "Depilación Láser",
  "cuidados-personalizados": "Cuidados Personalizados",
  "masajes": "Masajes"
}

const servicePrices = {
  "cosmetologia": 45000,
  "cejas-pestanas": 25000,
  "tricologia": 60000,
  "depilacion-laser": 80000,
  "cuidados-personalizados": 55000,
  "masajes": 40000
}

export default function AdvancedDashboard() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalReservations: 0,
    todayReservations: 0,
    weekReservations: 0,
    monthReservations: 0,
    confirmedRate: 0,
    popularServices: [],
    busyHours: [],
    weeklyTrend: [],
    monthlyRevenue: 0,
    averageDaily: 0,
    topClients: []
  })
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month')
  const [showCharts, setShowCharts] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    fetchReservations()
  }, [selectedPeriod])

  const fetchReservations = async () => {
    try {
      const now = new Date()
      let startDate: Date
      
      switch (selectedPeriod) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
        case 'year':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
          break
      }

      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .gte('selected_date', startDate.toISOString().split('T')[0])
        .order('selected_date', { ascending: true })

      if (error) {
        console.error('Error fetching reservations:', error)
        return
      }

      if (data) {
        setReservations(data)
        calculateStats(data)
      }
    } catch (error) {
      console.error('Error in fetchReservations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const calculateStats = (data: Reservation[]) => {
    const now = new Date()
    const today = now.toISOString().split('T')[0]
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Estadísticas básicas
    const totalReservations = data.length
    const todayReservations = data.filter(r => r.selected_date === today).length
    const weekReservations = data.filter(r => new Date(r.selected_date) >= weekAgo).length
    const monthReservations = data.filter(r => new Date(r.selected_date) >= monthAgo).length
    
    const confirmedCount = data.filter(r => r.status === 'confirmed').length
    const confirmedRate = totalReservations > 0 ? (confirmedCount / totalReservations) * 100 : 0

    // Servicios populares
    const serviceCount: { [key: string]: number } = {}
    data.forEach(r => {
      r.selected_services.forEach(service => {
        serviceCount[service] = (serviceCount[service] || 0) + 1
      })
    })

    const popularServices = Object.entries(serviceCount)
      .map(([service, count]) => ({
        name: serviceNames[service as keyof typeof serviceNames] || service,
        count,
        percentage: (count / totalReservations) * 100
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Horas más ocupadas
    const hourCount: { [key: string]: number } = {}
    data.forEach(r => {
      const hour = r.selected_time.split(':')[0] + ':00'
      hourCount[hour] = (hourCount[hour] || 0) + 1
    })

    const busyHours = Object.entries(hourCount)
      .map(([hour, count]) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)

    // Tendencia semanal
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
    const weeklyCount: { [key: string]: number } = {}
    
    data.forEach(r => {
      const date = new Date(r.selected_date)
      const dayName = dayNames[date.getDay()]
      weeklyCount[dayName] = (weeklyCount[dayName] || 0) + 1
    })

    const weeklyTrend = dayNames.map(day => ({
      day,
      count: weeklyCount[day] || 0
    }))

    // Ingresos estimados
    let monthlyRevenue = 0
    data.filter(r => r.status === 'confirmed' && new Date(r.selected_date) >= monthAgo)
      .forEach(r => {
        r.selected_services.forEach(service => {
          monthlyRevenue += servicePrices[service as keyof typeof servicePrices] || 0
        })
      })

    const averageDaily = monthlyRevenue / 30

    // Top clientes
    const clientCount: { [key: string]: { count: number; phone: string } } = {}
    data.forEach(r => {
      if (clientCount[r.client_name]) {
        clientCount[r.client_name].count++
      } else {
        clientCount[r.client_name] = { count: 1, phone: r.client_phone }
      }
    })

    const topClients = Object.entries(clientCount)
      .map(([name, data]) => ({ name, count: data.count, phone: data.phone }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    setStats({
      totalReservations,
      todayReservations,
      weekReservations,
      monthReservations,
      confirmedRate,
      popularServices,
      busyHours,
      weeklyTrend,
      monthlyRevenue,
      averageDaily,
      topClients
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getMaxCount = (data: { count: number }[]) => {
    return Math.max(...data.map(item => item.count), 1)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (showCharts) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Button 
            variant="outline" 
            onClick={() => setShowCharts(false)}
            className="mb-4"
          >
            ← Volver a Estadísticas
          </Button>
        </div>
        <ChartsDashboard />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header con filtros */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Avanzado</h1>
          <p className="text-gray-600">Análisis completo de tu negocio</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => setShowCharts(true)}
            className="border-green-300 text-green-700 hover:bg-green-50"
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            Ver Gráficos
          </Button>
          {(['week', 'month', 'year'] as const).map((period) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod(period)}
              className={selectedPeriod === period ? "bg-pink-500 hover:bg-pink-600" : ""}
            >
              {period === 'week' && 'Semana'}
              {period === 'month' && 'Mes'}
              {period === 'year' && 'Año'}
            </Button>
          ))}
        </div>
      </div>

      {/* KPIs principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos del Mes</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(stats.monthlyRevenue)}
            </div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              Promedio diario: {formatCurrency(stats.averageDaily)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Confirmación</CardTitle>
            <Target className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.confirmedRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.confirmedRate >= 80 ? '¡Excelente!' : stats.confirmedRate >= 60 ? 'Muy bueno' : 'Mejorable'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reservas del Período</CardTitle>
            <Calendar className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {selectedPeriod === 'week' ? stats.weekReservations : 
               selectedPeriod === 'month' ? stats.monthReservations : 
               stats.totalReservations}
            </div>
            <p className="text-xs text-muted-foreground">
              Hoy: {stats.todayReservations} reservas
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio Diario</CardTitle>
            <Activity className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {(stats.monthReservations / 30).toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              Reservas por día en promedio
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos y análisis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Servicios más populares */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="mr-2 h-5 w-5 text-yellow-500" />
              Servicios Más Populares
            </CardTitle>
            <CardDescription>
              Los tratamientos preferidos por tus clientes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.popularServices.map((service, index) => (
                <div key={service.name} className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-pink-100 text-pink-600 text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{service.name}</span>
                      <span className="text-sm text-gray-500">{service.count} reservas</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-pink-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${service.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {service.percentage.toFixed(1)}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Horas más ocupadas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5 text-blue-500" />
              Horas Más Ocupadas
            </CardTitle>
            <CardDescription>
              Los horarios con mayor demanda
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.busyHours.map((hour, index) => {
                const maxCount = getMaxCount(stats.busyHours)
                const percentage = (hour.count / maxCount) * 100
                
                return (
                  <div key={hour.hour} className="flex items-center space-x-3">
                    <div className="w-16 text-sm font-medium text-gray-700">
                      {hour.hour}
                    </div>
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="w-12 text-sm text-gray-500 text-right">
                      {hour.count}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Tendencia semanal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5 text-green-500" />
              Tendencia Semanal
            </CardTitle>
            <CardDescription>
              Distribución de reservas por día de la semana
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.weeklyTrend.map((day) => {
                const maxCount = getMaxCount(stats.weeklyTrend)
                const percentage = maxCount > 0 ? (day.count / maxCount) * 100 : 0
                
                return (
                  <div key={day.day} className="flex items-center space-x-3">
                    <div className="w-12 text-sm font-medium text-gray-700">
                      {day.day}
                    </div>
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-green-500 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="w-12 text-sm text-gray-500 text-right">
                      {day.count}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Top clientes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="mr-2 h-5 w-5 text-purple-500" />
              Clientes Frecuentes
            </CardTitle>
            <CardDescription>
              Tus mejores y más fieles clientes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topClients.map((client, index) => (
                <div key={client.name} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full text-white text-sm font-bold ${
                    index === 0 ? 'bg-yellow-500' :
                    index === 1 ? 'bg-gray-400' :
                    index === 2 ? 'bg-orange-400' : 'bg-purple-500'
                  }`}>
                    {index === 0 ? '👑' : index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{client.name}</div>
                    <div className="text-sm text-gray-500">{client.phone}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-purple-600">{client.count}</div>
                    <div className="text-xs text-gray-500">reservas</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumen y recomendaciones */}
      <Card className="border-l-4 border-l-pink-500">
        <CardHeader>
          <CardTitle className="flex items-center text-pink-700">
            <PieChart className="mr-2 h-5 w-5" />
            Insights y Recomendaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">💰 Ingresos</h4>
              <p className="text-sm text-blue-700">
                {stats.monthlyRevenue > 1000000 
                  ? "¡Excelente mes! Estás superando el millón."
                  : "Buen rendimiento, sigue así para alcanzar nuevas metas."
                }
              </p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">📊 Confirmaciones</h4>
              <p className="text-sm text-green-700">
                {stats.confirmedRate >= 80 
                  ? "Tu tasa de confirmación es excelente."
                  : "Considera seguir up con clientes para mejorar confirmaciones."
                }
              </p>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-semibold text-purple-800 mb-2">⭐ Servicios</h4>
              <p className="text-sm text-purple-700">
                {stats.popularServices[0]?.name 
                  ? `${stats.popularServices[0].name} es tu servicio estrella.`
                  : "Analiza qué servicios tienen más demanda."
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}