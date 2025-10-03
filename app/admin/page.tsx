'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
  BarChart3,
  Eye,
  X
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
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
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

  const handleViewDetails = (reservation: Reservation) => {
    setSelectedReservation(reservation)
    setShowDetailsModal(true)
  }

  const closeDetailsModal = () => {
    setShowDetailsModal(false)
    setSelectedReservation(null)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
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
      {/* Header responsive */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard Principal</h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Vista general de tu spa - {new Date().toLocaleDateString('es-ES', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <Button 
            variant="outline"
            onClick={() => setShowAdvanced(true)}
            className="border-pink-300 text-pink-700 hover:bg-pink-50 w-full sm:w-auto"
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Ver Análisis Avanzado</span>
            <span className="sm:hidden">Analytics</span>
          </Button>
          <Button 
            className="bg-pink-500 hover:bg-pink-600 w-full sm:w-auto" 
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Nueva Reserva</span>
            <span className="sm:hidden">Nueva</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
        {/* Stats Cards */}
        <div className="xl:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
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
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors space-y-3 sm:space-y-0"
                >
                  <div className="flex items-start sm:items-center space-x-3 flex-1">
                    <div className={`w-3 h-3 rounded-full mt-1 sm:mt-0 ${
                      reservation.status === 'confirmed' ? 'bg-green-500' : 
                      reservation.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-400'
                    }`}></div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mb-2">
                        <h4 className="font-medium text-gray-900 truncate">{reservation.client_name}</h4>
                        <Badge 
                          variant={reservation.status === 'confirmed' ? 'default' : 'secondary'}
                          className="w-fit mt-1 sm:mt-0"
                        >
                          {reservation.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                        </Badge>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Clock className="mr-1 h-3 w-3 flex-shrink-0" />
                          {reservation.selected_time}
                        </span>
                        {reservation.client_phone && (
                          <span className="flex items-center truncate">
                            <Phone className="mr-1 h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{reservation.client_phone}</span>
                          </span>
                        )}
                        {reservation.client_email && (
                          <span className="flex items-center truncate">
                            <Mail className="mr-1 h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{reservation.client_email}</span>
                          </span>
                        )}
                      </div>
                      
                      <div className="mt-2 text-sm text-gray-600">
                        <strong>Servicios:</strong> 
                        <span className="ml-1">
                          {reservation.selected_services.map(getServiceName).join(', ')}
                        </span>
                      </div>
                      
                      {reservation.comments && (
                        <div className="mt-2 text-sm text-gray-500 italic truncate">
                          "{reservation.comments}"
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-row sm:flex-col items-center space-x-2 sm:space-x-0 sm:space-y-2 sm:ml-4">
                    {reservation.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => confirmReservation(reservation.id)}
                        className="bg-green-500 hover:bg-green-600 text-white flex-1 sm:flex-none"
                      >
                        <CheckCircle className="mr-1 h-3 w-3" />
                        <span className="hidden sm:inline">Confirmar</span>
                        <span className="sm:hidden">✓</span>
                      </Button>
                    )}
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewDetails(reservation)}
                      className="flex-1 sm:flex-none"
                    >
                      <Eye className="mr-1 h-3 w-3" />
                      <span className="hidden sm:inline">Ver Detalles</span>
                      <span className="sm:hidden">Ver</span>
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

      {/* Modal para ver detalles de reserva */}
      <Dialog open={showDetailsModal} onOpenChange={closeDetailsModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-pink-600" />
              Detalles de la Reserva
            </DialogTitle>
            <DialogDescription>
              Información completa de la reserva seleccionada
            </DialogDescription>
          </DialogHeader>
          
          {selectedReservation && (
            <div className="space-y-6">
              {/* Información del cliente */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900 flex items-center">
                    <Users className="mr-2 h-4 w-4" />
                    Información del Cliente
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <span className="font-medium w-20">Nombre:</span>
                      <span className="text-gray-700">{selectedReservation.client_name}</span>
                    </div>
                    {selectedReservation.client_email && (
                      <div className="flex items-center">
                        <Mail className="mr-2 h-3 w-3 text-gray-400" />
                        <span className="text-gray-700">{selectedReservation.client_email}</span>
                      </div>
                    )}
                    {selectedReservation.client_phone && (
                      <div className="flex items-center">
                        <Phone className="mr-2 h-3 w-3 text-gray-400" />
                        <span className="text-gray-700">{selectedReservation.client_phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900 flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    Información de la Cita
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <span className="font-medium w-16">Fecha:</span>
                      <span className="text-gray-700">{formatDateDisplay(selectedReservation.selected_date)}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="mr-2 h-3 w-3 text-gray-400" />
                      <span className="text-gray-700">{selectedReservation.selected_time}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium w-16">Estado:</span>
                      <Badge 
                        variant={selectedReservation.status === 'confirmed' ? 'default' : 'secondary'}
                        className="ml-1"
                      >
                        {selectedReservation.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Servicios seleccionados */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Servicios Seleccionados</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedReservation.selected_services.map((serviceId, index) => (
                    <div 
                      key={index}
                      className="flex items-center p-3 bg-pink-50 border border-pink-200 rounded-lg"
                    >
                      <CheckCircle className="mr-2 h-4 w-4 text-pink-600" />
                      <span className="text-sm font-medium text-pink-700">
                        {getServiceName(serviceId)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Comentarios */}
              {selectedReservation.comments && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">Comentarios Adicionales</h3>
                  <div className="p-3 bg-gray-50 border rounded-lg">
                    <p className="text-sm text-gray-700">{selectedReservation.comments}</p>
                  </div>
                </div>
              )}

              {/* Información adicional */}
              <div className="pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-500">
                  <div>
                    <span className="font-medium">ID de Reserva:</span> {String(selectedReservation.id).slice(0, 8)}...
                  </div>
                  <div>
                    <span className="font-medium">Creada el:</span> {new Date(selectedReservation.created_at).toLocaleString('es-ES')}
                  </div>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                {selectedReservation.status === 'pending' && (
                  <Button 
                    onClick={() => {
                      confirmReservation(selectedReservation.id)
                      closeDetailsModal()
                    }}
                    className="bg-green-500 hover:bg-green-600 text-white flex-1"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Confirmar Reserva
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  onClick={closeDetailsModal}
                  className="flex-1"
                >
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}