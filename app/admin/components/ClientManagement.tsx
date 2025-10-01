'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Users, 
  Search, 
  Phone, 
  Mail, 
  Calendar,
  Clock,
  Star,
  TrendingUp,
  Filter,
  Download,
  Eye,
  Heart,
  Award,
  UserCheck,
  Activity
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

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

interface ClientProfile {
  name: string
  email: string
  phone: string
  totalReservations: number
  confirmedReservations: number
  totalSpent: number
  favoriteServices: string[]
  lastVisit: string
  firstVisit: string
  averageMonthlyVisits: number
  loyaltyLevel: 'Nuevo' | 'Regular' | 'VIP' | 'Diamante'
  reservations: Reservation[]
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

export default function ClientManagement() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [clients, setClients] = useState<ClientProfile[]>([])
  const [filteredClients, setFilteredClients] = useState<ClientProfile[]>([])
  const [selectedClient, setSelectedClient] = useState<ClientProfile | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [loyaltyFilter, setLoyaltyFilter] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalClients: 0,
    newThisMonth: 0,
    vipClients: 0,
    averageLifetimeValue: 0
  })

  const supabase = createClient()

  useEffect(() => {
    fetchReservations()
  }, [])

  useEffect(() => {
    processClientData()
  }, [reservations])

  useEffect(() => {
    filterClients()
  }, [clients, searchTerm, loyaltyFilter])

  const fetchReservations = async () => {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching reservations:', error)
        return
      }

      if (data) {
        setReservations(data)
      }
    } catch (error) {
      console.error('Error in fetchReservations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const processClientData = () => {
    const clientMap: { [key: string]: ClientProfile } = {}

    reservations.forEach(reservation => {
      const clientKey = `${reservation.client_name}-${reservation.client_phone}`
      
      if (!clientMap[clientKey]) {
        clientMap[clientKey] = {
          name: reservation.client_name,
          email: reservation.client_email,
          phone: reservation.client_phone,
          totalReservations: 0,
          confirmedReservations: 0,
          totalSpent: 0,
          favoriteServices: [],
          lastVisit: reservation.selected_date,
          firstVisit: reservation.selected_date,
          averageMonthlyVisits: 0,
          loyaltyLevel: 'Nuevo',
          reservations: []
        }
      }

      const client = clientMap[clientKey]
      client.reservations.push(reservation)
      client.totalReservations++
      
      if (reservation.status === 'confirmed') {
        client.confirmedReservations++
        
        // Calcular gasto total
        reservation.selected_services.forEach(service => {
          client.totalSpent += servicePrices[service as keyof typeof servicePrices] || 0
        })
      }

      // Actualizar primera y última visita
      if (reservation.selected_date > client.lastVisit) {
        client.lastVisit = reservation.selected_date
      }
      if (reservation.selected_date < client.firstVisit) {
        client.firstVisit = reservation.selected_date
      }
    })

    // Procesar servicios favoritos y niveles de lealtad
    Object.values(clientMap).forEach(client => {
      // Contar servicios favoritos
      const serviceCount: { [key: string]: number } = {}
      client.reservations.forEach(reservation => {
        reservation.selected_services.forEach(service => {
          const serviceName = serviceNames[service as keyof typeof serviceNames] || service
          serviceCount[serviceName] = (serviceCount[serviceName] || 0) + 1
        })
      })

      client.favoriteServices = Object.entries(serviceCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([service]) => service)

      // Calcular promedio mensual
      const firstVisitDate = new Date(client.firstVisit)
      const lastVisitDate = new Date(client.lastVisit)
      const monthsDiff = Math.max(1, Math.round((lastVisitDate.getTime() - firstVisitDate.getTime()) / (1000 * 60 * 60 * 24 * 30)))
      client.averageMonthlyVisits = Number((client.confirmedReservations / monthsDiff).toFixed(1))

      // Determinar nivel de lealtad
      if (client.totalReservations >= 20 || client.totalSpent >= 1000000) {
        client.loyaltyLevel = 'Diamante'
      } else if (client.totalReservations >= 10 || client.totalSpent >= 500000) {
        client.loyaltyLevel = 'VIP'
      } else if (client.totalReservations >= 3 || client.totalSpent >= 150000) {
        client.loyaltyLevel = 'Regular'
      } else {
        client.loyaltyLevel = 'Nuevo'
      }
    })

    const clientList = Object.values(clientMap).sort((a, b) => b.totalSpent - a.totalSpent)
    setClients(clientList)

    // Calcular estadísticas
    const now = new Date()
    const thisMonth = now.getMonth()
    const thisYear = now.getFullYear()

    const newThisMonth = clientList.filter(client => {
      const firstVisit = new Date(client.firstVisit)
      return firstVisit.getMonth() === thisMonth && firstVisit.getFullYear() === thisYear
    }).length

    const vipClients = clientList.filter(client => 
      client.loyaltyLevel === 'VIP' || client.loyaltyLevel === 'Diamante'
    ).length

    const averageLifetimeValue = clientList.length > 0 
      ? clientList.reduce((sum, client) => sum + client.totalSpent, 0) / clientList.length 
      : 0

    setStats({
      totalClients: clientList.length,
      newThisMonth,
      vipClients,
      averageLifetimeValue
    })
  }

  const filterClients = () => {
    let filtered = clients

    // Filtro por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone.includes(searchTerm) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtro por nivel de lealtad
    if (loyaltyFilter !== 'all') {
      filtered = filtered.filter(client => client.loyaltyLevel === loyaltyFilter)
    }

    setFilteredClients(filtered)
  }

  const getLoyaltyColor = (level: string) => {
    switch (level) {
      case 'Diamante': return 'bg-purple-100 text-purple-800 border-purple-300'
      case 'VIP': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'Regular': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'Nuevo': return 'bg-green-100 text-green-800 border-green-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getLoyaltyIcon = (level: string) => {
    switch (level) {
      case 'Diamante': return '💎'
      case 'VIP': return '👑'
      case 'Regular': return '⭐'
      case 'Nuevo': return '🌟'
      default: return '👤'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const exportToCSV = () => {
    const headers = ['Nombre', 'Teléfono', 'Email', 'Total Reservas', 'Total Gastado', 'Nivel Lealtad', 'Última Visita']
    const csvData = filteredClients.map(client => [
      client.name,
      client.phone,
      client.email,
      client.totalReservations,
      client.totalSpent,
      client.loyaltyLevel,
      client.lastVisit
    ])

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `clientes_monnas_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Clientes</h1>
          <p className="text-gray-600">
            Administra y analiza la información de tus clientes
          </p>
        </div>
        <Button onClick={exportToCSV} className="bg-green-500 hover:bg-green-600">
          <Download className="mr-2 h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalClients}</div>
            <p className="text-xs text-muted-foreground">
              Base de clientes registrada
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nuevos este Mes</CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.newThisMonth}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              Crecimiento mensual
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes VIP+</CardTitle>
            <Award className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.vipClients}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalClients > 0 ? Math.round((stats.vipClients / stats.totalClients) * 100) : 0}% del total
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Promedio</CardTitle>
            <Activity className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(stats.averageLifetimeValue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Valor de vida del cliente
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Clientes */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Lista de Clientes
              </CardTitle>
              <div className="flex space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar cliente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <select
                  value={loyaltyFilter}
                  onChange={(e) => setLoyaltyFilter(e.target.value)}
                  className="px-3 py-2 border rounded-md text-sm"
                >
                  <option value="all">Todos los niveles</option>
                  <option value="Diamante">Diamante</option>
                  <option value="VIP">VIP</option>
                  <option value="Regular">Regular</option>
                  <option value="Nuevo">Nuevo</option>
                </select>
              </div>
            </div>
            <CardDescription>
              {filteredClients.length} cliente{filteredClients.length !== 1 ? 's' : ''} 
              {loyaltyFilter !== 'all' && ` (${loyaltyFilter})`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredClients.map((client, index) => (
                <div
                  key={`${client.name}-${client.phone}`}
                  onClick={() => setSelectedClient(client)}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                      client.loyaltyLevel === 'Diamante' ? 'bg-purple-100' :
                      client.loyaltyLevel === 'VIP' ? 'bg-yellow-100' :
                      client.loyaltyLevel === 'Regular' ? 'bg-blue-100' : 'bg-green-100'
                    }`}>
                      {getLoyaltyIcon(client.loyaltyLevel)}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{client.name}</h4>
                      <div className="flex items-center space-x-3 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Phone className="mr-1 h-3 w-3" />
                          {client.phone}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="mr-1 h-3 w-3" />
                          {client.totalReservations} citas
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <Badge className={`mb-2 ${getLoyaltyColor(client.loyaltyLevel)}`}>
                      {client.loyaltyLevel}
                    </Badge>
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(client.totalSpent)}
                    </div>
                    <div className="text-xs text-gray-500">
                      Última visita: {new Date(client.lastVisit).toLocaleDateString('es-ES')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Perfil del Cliente Seleccionado */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Eye className="mr-2 h-5 w-5" />
              {selectedClient ? 'Perfil del Cliente' : 'Selecciona un Cliente'}
            </CardTitle>
            <CardDescription>
              {selectedClient ? 'Información detallada y historial' : 'Haz clic en cualquier cliente para ver sus detalles'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedClient ? (
              <div className="space-y-4">
                {/* Info básica */}
                <div className="text-center">
                  <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center text-3xl mb-3 ${
                    selectedClient.loyaltyLevel === 'Diamante' ? 'bg-purple-100' :
                    selectedClient.loyaltyLevel === 'VIP' ? 'bg-yellow-100' :
                    selectedClient.loyaltyLevel === 'Regular' ? 'bg-blue-100' : 'bg-green-100'
                  }`}>
                    {getLoyaltyIcon(selectedClient.loyaltyLevel)}
                  </div>
                  <h3 className="font-semibold text-lg">{selectedClient.name}</h3>
                  <Badge className={`mt-2 ${getLoyaltyColor(selectedClient.loyaltyLevel)}`}>
                    Cliente {selectedClient.loyaltyLevel}
                  </Badge>
                </div>

                {/* Contacto */}
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2 text-gray-900">Contacto</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Phone className="mr-2 h-4 w-4" />
                      {selectedClient.phone}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Mail className="mr-2 h-4 w-4" />
                      {selectedClient.email}
                    </div>
                  </div>
                </div>

                {/* Estadísticas */}
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3 text-gray-900">Estadísticas</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="text-center p-2 bg-blue-50 rounded">
                      <div className="font-semibold text-blue-600">{selectedClient.totalReservations}</div>
                      <div className="text-blue-500">Total Citas</div>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded">
                      <div className="font-semibold text-green-600">{selectedClient.confirmedReservations}</div>
                      <div className="text-green-500">Confirmadas</div>
                    </div>
                    <div className="text-center p-2 bg-purple-50 rounded">
                      <div className="font-semibold text-purple-600">
                        {formatCurrency(selectedClient.totalSpent)}
                      </div>
                      <div className="text-purple-500">Total Gastado</div>
                    </div>
                    <div className="text-center p-2 bg-orange-50 rounded">
                      <div className="font-semibold text-orange-600">{selectedClient.averageMonthlyVisits}</div>
                      <div className="text-orange-500">Citas/Mes</div>
                    </div>
                  </div>
                </div>

                {/* Servicios favoritos */}
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2 text-gray-900 flex items-center">
                    <Heart className="mr-2 h-4 w-4 text-red-500" />
                    Servicios Favoritos
                  </h4>
                  <div className="space-y-1">
                    {selectedClient.favoriteServices.slice(0, 3).map((service, index) => (
                      <div key={service} className="flex items-center justify-between text-sm">
                        <span className="flex items-center">
                          <Star className="mr-1 h-3 w-3 text-yellow-500" />
                          {service}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          #{index + 1}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Historial reciente */}
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2 text-gray-900 flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-gray-500" />
                    Historial Reciente
                  </h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {selectedClient.reservations.slice(0, 5).map((reservation) => (
                      <div key={reservation.id} className="text-xs p-2 bg-gray-50 rounded">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium">{reservation.selected_date}</span>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              reservation.status === 'confirmed' 
                                ? 'border-green-300 text-green-700' 
                                : 'border-yellow-300 text-yellow-700'
                            }`}
                          >
                            {reservation.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                          </Badge>
                        </div>
                        <div className="text-gray-600">
                          {reservation.selected_services.map(s => 
                            serviceNames[s as keyof typeof serviceNames] || s
                          ).join(', ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fechas importantes */}
                <div className="border-t pt-4 text-xs text-gray-500">
                  <div className="flex justify-between">
                    <span>Primera visita:</span>
                    <span>{new Date(selectedClient.firstVisit).toLocaleDateString('es-ES')}</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span>Última visita:</span>
                    <span>{new Date(selectedClient.lastVisit).toLocaleDateString('es-ES')}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="mx-auto h-12 w-12 mb-4 text-gray-400" />
                <p className="text-sm">Selecciona un cliente de la lista para ver su perfil completo</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}