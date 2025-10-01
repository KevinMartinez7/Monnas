'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  User, 
  Phone,
  Plus,
  Eye
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import AddReservationModal from '../components/AddReservationModal'

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

interface CalendarDay {
  date: Date
  isCurrentMonth: boolean
  reservations: Reservation[]
}

export default function CalendarView() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedDayReservations, setSelectedDayReservations] = useState<Reservation[]>([])

  const supabase = createClient()

  // Función para crear fecha sin problemas de zona horaria
  const createDateFromString = (dateString: string) => {
    const [year, month, day] = dateString.split('-')
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
  }

  useEffect(() => {
    fetchReservations()
  }, [currentMonth])

  const fetchReservations = async () => {
    try {
      // Obtener reservas del mes actual y adyacentes
      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
      const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 2, 0)

      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .gte('selected_date', startOfMonth.toISOString().split('T')[0])
        .lte('selected_date', endOfMonth.toISOString().split('T')[0])
        .order('selected_time', { ascending: true })

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

  const generateCalendarDays = (): CalendarDay[] => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    
    // Empezar desde el domingo de la semana que contiene el primer día del mes
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    const days: CalendarDay[] = []
    const currentDate = new Date(startDate)

    // Generar 42 días (6 semanas)
    for (let i = 0; i < 42; i++) {
      const dateString = currentDate.toISOString().split('T')[0]
      const dayReservations = reservations.filter(r => r.selected_date === dateString)
      
      days.push({
        date: new Date(currentDate),
        isCurrentMonth: currentDate.getMonth() === month,
        reservations: dayReservations
      })
      
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return days
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth)
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1)
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1)
    }
    setCurrentMonth(newMonth)
  }

  const handleDayClick = (day: CalendarDay) => {
    setSelectedDate(day.date)
    setSelectedDayReservations(day.reservations)
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
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

  const calendarDays = generateCalendarDays()
  const monthStats = {
    total: reservations.filter(r => {
      const reservationDate = createDateFromString(r.selected_date)
      return reservationDate.getMonth() === currentMonth.getMonth() && 
             reservationDate.getFullYear() === currentMonth.getFullYear()
    }).length,
    confirmed: reservations.filter(r => {
      const reservationDate = createDateFromString(r.selected_date)
      return reservationDate.getMonth() === currentMonth.getMonth() && 
             reservationDate.getFullYear() === currentMonth.getFullYear() &&
             r.status === 'confirmed'
    }).length,
    pending: reservations.filter(r => {
      const reservationDate = createDateFromString(r.selected_date)
      return reservationDate.getMonth() === currentMonth.getMonth() && 
             reservationDate.getFullYear() === currentMonth.getFullYear() &&
             r.status === 'pending'
    }).length
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
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
          <h1 className="text-3xl font-bold text-gray-900">Calendario de Reservas</h1>
          <p className="text-gray-600">
            Vista mensual de todas las citas programadas
          </p>
        </div>
        <Button 
          className="bg-pink-500 hover:bg-pink-600"
          onClick={() => setShowAddModal(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nueva Reserva
        </Button>
      </div>

      {/* Stats del mes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total del Mes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{monthStats.total}</div>
            <p className="text-xs text-muted-foreground">
              {currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmadas</CardTitle>
            <Calendar className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{monthStats.confirmed}</div>
            <p className="text-xs text-muted-foreground">
              {monthStats.total > 0 ? Math.round((monthStats.confirmed / monthStats.total) * 100) : 0}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Calendar className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{monthStats.pending}</div>
            <p className="text-xs text-muted-foreground">
              Esperando confirmación
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendario */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                {currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateMonth('prev')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentMonth(new Date())}
                  className="text-sm"
                >
                  Hoy
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateMonth('next')}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Encabezados de días */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Días del calendario */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => (
                <button
                  key={index}
                  onClick={() => handleDayClick(day)}
                  className={`
                    p-2 min-h-[80px] text-sm rounded-md border transition-all duration-200 hover:bg-gray-50 relative
                    ${!day.isCurrentMonth ? 'text-gray-300 bg-gray-50' : 'text-gray-900'}
                    ${isToday(day.date) ? 'bg-blue-100 border-blue-300 font-bold' : 'border-gray-200'}
                    ${selectedDate?.toDateString() === day.date.toDateString() ? 'ring-2 ring-pink-500' : ''}
                  `}
                >
                  <div className="flex flex-col h-full">
                    <span className="text-left mb-1">{day.date.getDate()}</span>
                    
                    <div className="flex-1 space-y-1">
                      {day.reservations.slice(0, 2).map((reservation, idx) => (
                        <div
                          key={idx}
                          className={`text-xs p-1 rounded truncate ${
                            reservation.status === 'confirmed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                          title={`${reservation.selected_time} - ${reservation.client_name}`}
                        >
                          {reservation.selected_time} {reservation.client_name.split(' ')[0]}
                        </div>
                      ))}
                      
                      {day.reservations.length > 2 && (
                        <div className="text-xs text-gray-500 text-center">
                          +{day.reservations.length - 2} más
                        </div>
                      )}
                    </div>

                    {day.reservations.length > 0 && (
                      <div className="absolute top-1 right-1">
                        <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Panel de detalles del día seleccionado */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {selectedDate ? (
                <>
                  <Clock className="mr-2 h-5 w-5 inline" />
                  {selectedDate.toLocaleDateString('es-ES', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long' 
                  })}
                </>
              ) : (
                'Selecciona un día'
              )}
            </CardTitle>
            <CardDescription>
              {selectedDate ? (
                `${selectedDayReservations.length} reserva${selectedDayReservations.length !== 1 ? 's' : ''}`
              ) : (
                'Haz clic en cualquier día del calendario para ver sus reservas'
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedDate ? (
              selectedDayReservations.length === 0 ? (
                <div className="text-center py-6">
                  <Calendar className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">No hay reservas para este día</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedDayReservations.map((reservation) => (
                    <div 
                      key={reservation.id} 
                      className="border rounded-lg p-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Badge className={
                            reservation.status === 'confirmed' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }>
                            {reservation.selected_time}
                          </Badge>
                          <span className="font-medium text-sm">{reservation.client_name}</span>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${
                          reservation.status === 'confirmed' ? 'bg-green-500' : 'bg-yellow-500'
                        }`}></div>
                      </div>
                      
                      <div className="text-xs text-gray-600 space-y-1">
                        <div className="flex items-center">
                          <Phone className="mr-1 h-3 w-3" />
                          {reservation.client_phone}
                        </div>
                        <div>
                          <strong>Servicios:</strong> {reservation.selected_services.map(getServiceName).join(', ')}
                        </div>
                        {reservation.comments && (
                          <div className="italic">
                            "{reservation.comments}"
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div className="text-center py-6 text-gray-500">
                <Eye className="mx-auto h-8 w-8 mb-2" />
                <p className="text-sm">Selecciona un día para ver los detalles</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal para agregar reservas */}
      <AddReservationModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          fetchReservations()
        }}
      />
    </div>
  )
}