'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
} from 'chart.js'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import { TrendingUp, DollarSign, Calendar, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
)

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

interface ChartData {
  weeklyReservations: { labels: string[]; data: number[] }
  serviceDistribution: { labels: string[]; data: number[] }
  monthlyTrend: { labels: string[]; data: number[] }
  hourlyDistribution: { labels: string[]; data: number[] }
}

const serviceNames = {
  "cosmetologia": "Cosmetología",
  "cejas-pestanas": "Cejas & Pestañas", 
  "tricologia": "Tricología",
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

export default function ChartsDashboard() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [chartData, setChartData] = useState<ChartData>({
    weeklyReservations: { labels: [], data: [] },
    serviceDistribution: { labels: [], data: [] },
    monthlyTrend: { labels: [], data: [] },
    hourlyDistribution: { labels: [], data: [] }
  })
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month')

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
        processChartData(data)
      }
    } catch (error) {
      console.error('Error in fetchReservations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const processChartData = (data: Reservation[]) => {
    // Datos semanales
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
    const weeklyCount: { [key: string]: number } = {}
    
    data.forEach(r => {
      const date = new Date(r.selected_date)
      const dayName = dayNames[date.getDay()]
      weeklyCount[dayName] = (weeklyCount[dayName] || 0) + 1
    })

    const weeklyReservations = {
      labels: dayNames,
      data: dayNames.map(day => weeklyCount[day] || 0)
    }

    // Distribución de servicios
    const serviceCount: { [key: string]: number } = {}
    data.forEach(r => {
      r.selected_services.forEach(service => {
        const serviceName = serviceNames[service as keyof typeof serviceNames] || service
        serviceCount[serviceName] = (serviceCount[serviceName] || 0) + 1
      })
    })

    const serviceDistribution = {
      labels: Object.keys(serviceCount),
      data: Object.values(serviceCount)
    }

    // Tendencia mensual (últimos 30 días)
    const last30Days = Array.from({length: 30}, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (29 - i))
      return date.toISOString().split('T')[0]
    })

    const dailyCount: { [key: string]: number } = {}
    data.forEach(r => {
      dailyCount[r.selected_date] = (dailyCount[r.selected_date] || 0) + 1
    })

    const monthlyTrend = {
      labels: last30Days.map(date => {
        const d = new Date(date)
        return `${d.getDate()}/${d.getMonth() + 1}`
      }),
      data: last30Days.map(date => dailyCount[date] || 0)
    }

    // Distribución por horas
    const hourlyCount: { [key: string]: number } = {}
    data.forEach(r => {
      const hour = parseInt(r.selected_time.split(':')[0])
      const hourRange = `${hour}:00`
      hourlyCount[hourRange] = (hourlyCount[hourRange] || 0) + 1
    })

    const sortedHours = Object.keys(hourlyCount).sort()
    const hourlyDistribution = {
      labels: sortedHours,
      data: sortedHours.map(hour => hourlyCount[hour] || 0)
    }

    setChartData({
      weeklyReservations,
      serviceDistribution,
      monthlyTrend,
      hourlyDistribution
    })
  }

  const weeklyBarData = {
    labels: chartData.weeklyReservations.labels,
    datasets: [
      {
        label: 'Reservas por día',
        data: chartData.weeklyReservations.data,
        backgroundColor: 'rgba(236, 72, 153, 0.8)',
        borderColor: 'rgba(236, 72, 153, 1)',
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
      }
    ]
  }

  const serviceDoughnutData = {
    labels: chartData.serviceDistribution.labels,
    datasets: [
      {
        data: chartData.serviceDistribution.data,
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40'
        ],
        borderWidth: 2,
        borderColor: '#ffffff'
      }
    ]
  }

  const monthlyLineData = {
    labels: chartData.monthlyTrend.labels,
    datasets: [
      {
        label: 'Reservas diarias',
        data: chartData.monthlyTrend.data,
        fill: true,
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 3,
        pointBackgroundColor: 'rgba(34, 197, 94, 1)',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        tension: 0.4
      }
    ]
  }

  const hourlyBarData = {
    labels: chartData.hourlyDistribution.labels,
    datasets: [
      {
        label: 'Reservas por hora',
        data: chartData.hourlyDistribution.data,
        backgroundColor: 'rgba(147, 51, 234, 0.8)',
        borderColor: 'rgba(147, 51, 234, 1)',
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            size: 12
          },
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 11
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          font: {
            size: 11
          }
        }
      }
    }
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          font: {
            size: 11
          },
          padding: 15,
          usePointStyle: true
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8
      }
    },
    cutout: '60%'
  }

  // Estadísticas calculadas
  const totalReservations = reservations.length
  const totalRevenue = reservations
    .filter(r => r.status === 'confirmed')
    .reduce((total, r) => {
      return total + r.selected_services.reduce((serviceTotal, service) => {
        return serviceTotal + (servicePrices[service as keyof typeof servicePrices] || 0)
      }, 0)
    }, 0)

  const avgDailyReservations = totalReservations / 30
  const confirmedRate = totalReservations > 0 ? (reservations.filter(r => r.status === 'confirmed').length / totalReservations) * 100 : 0

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

  return (
    <div className="space-y-6">
      {/* Header con filtros */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Análisis Visual</h2>
          <p className="text-gray-600">Gráficos detallados de tu negocio</p>
        </div>
        <div className="flex space-x-2">
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
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Total</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${totalRevenue.toLocaleString()}
            </div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              Confirmadas únicamente
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reservas</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalReservations}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Período seleccionado
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio Diario</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {avgDailyReservations.toFixed(1)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Reservas por día
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa Confirmación</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {confirmedRate.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Conversión de reservas
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reservas por día de la semana */}
        <Card>
          <CardHeader>
            <CardTitle>Reservas por Día de la Semana</CardTitle>
            <CardDescription>
              Identifica los días con mayor demanda
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Bar data={weeklyBarData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        {/* Distribución de servicios */}
        <Card>
          <CardHeader>
            <CardTitle>Servicios Más Populares</CardTitle>
            <CardDescription>
              Distribución de preferencias de tus clientes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Doughnut data={serviceDoughnutData} options={doughnutOptions} />
            </div>
          </CardContent>
        </Card>

        {/* Tendencia mensual */}
        <Card>
          <CardHeader>
            <CardTitle>Tendencia de Reservas (30 días)</CardTitle>
            <CardDescription>
              Evolución diaria de tu negocio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Line data={monthlyLineData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        {/* Distribución por horas */}
        <Card>
          <CardHeader>
            <CardTitle>Horas Más Ocupadas</CardTitle>
            <CardDescription>
              Optimiza tu horario según la demanda
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Bar data={hourlyBarData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}