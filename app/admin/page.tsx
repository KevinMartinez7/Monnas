'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle, 
  AlertCircle, 
  Plus,
  Phone,
  Mail,
  MapPin,
  BarChart3
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import AddReservationModal from './components/AddReservationModal'
import NotificationWidget from './components/NotificationWidget'
import AdvancedDashboard from './components/AdvancedDashboard'

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

export default function AdminDashboard() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [todayReservations, setTodayReservations] = useState<Reservation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    today: 0
  })

  const supabase = createClient()

  // Función para formatear fecha sin problemas de zona horaria
  const formatDateDisplay = (dateString: string) => {
    const [year, month, day] = dateString.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    return date.toLocaleDateString('es-ES')
  }

  useEffect(() => {
    fetchReservations()
  }, [])

  const fetchReservations = async () => {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .order('selected_date', { ascending: true })
        .order('selected_time', { ascending: true })

      if (error) {
        console.error('Error fetching reservations:', error)
        return
      }

      if (data) {
        setReservations(data)
        
        // Filtrar reservas de hoy
        const today = new Date().toISOString().split('T')[0]
        const todayData = data.filter(r => r.selected_date === today)
        setTodayReservations(todayData)

        // Calcular estadísticas
        setStats({
          total: data.length,
          pending: data.filter(r => r.status === 'pending').length,
          confirmed: data.filter(r => r.status === 'confirmed').length,
          today: todayData.length
        })
      }
    } catch (error) {
      console.error('Error in fetchReservations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const confirmReservation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('reservations')
        .update({ status: 'confirmed' })
        .eq('id', id)

      if (!error) {
        fetchReservations()
      }
    } catch (error) {
      console.error('Error confirming reservation:', error)
    }
  }

  const getServiceNames = () => {
    const services = [
      { id: "cosmetologia", name: "Cosmetología" },
      { id: "cejas-pestanas", name: "Cejas & Pestañas" },
      { id: "tricologia", name: "Tricología Facial" },
      { id: "depilacion-laser", name: "Depilación Láser" },
      { id: "cuidados-personalizados", name: "Cuidados Personalizados" },
      { id: "masajes", name: "Masajes" },
    ]
    return services
  }

  const getServiceName = (serviceId: string) => {
    const service = getServiceNames().find(s => s.id === serviceId)
    return service ? service.name : serviceId
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (showAdvanced) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Button 
            variant="outline" 
            onClick={() => setShowAdvanced(false)}
            className="mb-4"
          >
            ← Volver al Dashboard Simple
          </Button>
        </div>
        <AdvancedDashboard />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Principal</h1>
          <p className="text-gray-600">
            Vista general de tu spa - {new Date().toLocaleDateString('es-ES', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        <div className="flex space-x-3">
          <Button 
            variant="outline"
            onClick={() => setShowAdvanced(true)}
            className="border-pink-300 text-pink-700 hover:bg-pink-50"
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            Ver Análisis Avanzado
          </Button>
          <Button className="bg-pink-500 hover:bg-pink-600" onClick={() => setShowAddModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Reserva
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stats Cards */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Reservas Hoy</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-pink-600">{stats.today}</div>
                <p className="text-xs text-muted-foreground">
                  Citas programadas para hoy
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
                <AlertCircle className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                <p className="text-xs text-muted-foreground">
                  Esperando confirmación
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Confirmadas</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
                <p className="text-xs text-muted-foreground">
                  Citas confirmadas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                <p className="text-xs text-muted-foreground">
                  Todas las reservas
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Notification Widget */}
        <div className="lg:col-span-1">
          <NotificationWidget />
        </div>
      </div>

      {/* Today's Reservations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="mr-2 h-5 w-5" />
            Reservas de Hoy
          </CardTitle>
          <CardDescription>
            Gestiona las citas programadas para hoy
          </CardDescription>
        </CardHeader>
        <CardContent>
          {todayReservations.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay reservas para hoy</h3>
              <p className="mt-1 text-sm text-gray-500">
                Todas las citas de hoy han sido completadas o no hay reservas programadas.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {todayReservations.map((reservation) => (
                <div 
                  key={reservation.id} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${
                      reservation.status === 'confirmed' ? 'bg-green-500' : 
                      reservation.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-400'
                    }`}></div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-1">
                        <h4 className="font-medium text-gray-900">{reservation.client_name}</h4>
                        <Badge variant={reservation.status === 'confirmed' ? 'default' : 'secondary'}>
                          {reservation.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Clock className="mr-1 h-3 w-3" />
                          {reservation.selected_time}
                        </span>
                        {reservation.client_phone && (
                          <span className="flex items-center">
                            <Phone className="mr-1 h-3 w-3" />
                            {reservation.client_phone}
                          </span>
                        )}
                        {reservation.client_email && (
                          <span className="flex items-center">
                            <Mail className="mr-1 h-3 w-3" />
                            {reservation.client_email}
                          </span>
                        )}
                      </div>
                      
                      <div className="mt-1 text-sm text-gray-600">
                        <strong>Servicios:</strong> {reservation.selected_services.map(getServiceName).join(', ')}
                      </div>
                      
                      {reservation.comments && (
                        <div className="mt-1 text-sm text-gray-500 italic">
                          "{reservation.comments}"
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {reservation.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => confirmReservation(reservation.id)}
                        className="bg-green-500 hover:bg-green-600 text-white"
                      >
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Confirmar
                      </Button>
                    )}
                    
                    <Button variant="outline" size="sm">
                      Ver Detalles
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
          <CardDescription>
            Últimas reservas realizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {reservations.slice(0, 5).map((reservation) => (
              <div key={reservation.id} className="flex items-center space-x-3 text-sm">
                <div className={`w-2 h-2 rounded-full ${
                  reservation.status === 'confirmed' ? 'bg-green-500' : 'bg-yellow-500'
                }`}></div>
                <span className="font-medium">{reservation.client_name}</span>
                <span className="text-gray-500">
                  reservó para el {formatDateDisplay(reservation.selected_date)}
                </span>
                <span className="text-gray-400">
                  {new Date(reservation.created_at).toLocaleDateString('es-ES')}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Modal para agregar reservas */}
      <AddReservationModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          fetchReservations() // Recargar datos después de agregar
        }}
      />
    </div>
  )
}