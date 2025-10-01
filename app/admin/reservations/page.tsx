'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Phone,
  Mail,
  User,
  Plus,
  Download,
  Eye
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import AddReservationModal from '../components/AddReservationModal'
import EditReservationModal from '../components/EditReservationModal'

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

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('')

  const supabase = createClient()

  // Función para formatear fecha sin problemas de zona horaria
  const formatDateDisplay = (dateString: string) => {
    const [year, month, day] = dateString.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit'
    })
  }

  useEffect(() => {
    fetchReservations()
  }, [])

  useEffect(() => {
    filterReservations()
  }, [reservations, searchTerm, statusFilter, dateFilter])

  const fetchReservations = async () => {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .order('selected_date', { ascending: false })
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

  const filterReservations = () => {
    let filtered = [...reservations]

    // Filtro por búsqueda de texto
    if (searchTerm) {
      filtered = filtered.filter(reservation =>
        reservation.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reservation.client_phone.includes(searchTerm) ||
        (reservation.client_email && reservation.client_email.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Filtro por estado
    if (statusFilter !== 'all') {
      filtered = filtered.filter(reservation => reservation.status === statusFilter)
    }

    // Filtro por fecha
    if (dateFilter) {
      filtered = filtered.filter(reservation => reservation.selected_date === dateFilter)
    }

    setFilteredReservations(filtered)
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

  const deleteReservation = async (id: string, clientName: string) => {
    if (!confirm(`¿Estás segura de que quieres eliminar la reserva de ${clientName}?`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('reservations')
        .delete()
        .eq('id', id)

      if (!error) {
        fetchReservations()
        alert('Reserva eliminada exitosamente')
      }
    } catch (error) {
      console.error('Error deleting reservation:', error)
      alert('Error al eliminar la reserva')
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800">Confirmada</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const exportReservations = () => {
    const csvContent = [
      ['Fecha', 'Hora', 'Cliente', 'Teléfono', 'Email', 'Servicios', 'Estado', 'Comentarios'],
      ...filteredReservations.map(r => [
        r.selected_date,
        r.selected_time,
        r.client_name,
        r.client_phone,
        r.client_email || '',
        r.selected_services.map(getServiceName).join('; '),
        r.status === 'confirmed' ? 'Confirmada' : 'Pendiente',
        r.comments || ''
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `reservas-monnas-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleEditReservation = (reservation: Reservation) => {
    setSelectedReservation(reservation)
    setShowEditModal(true)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Reservas</h1>
          <p className="text-gray-600">
            Administra todas las reservas de Monnas ({filteredReservations.length} de {reservations.length})
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportReservations}>
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Button 
            className="bg-pink-500 hover:bg-pink-600"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nueva Reserva
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Buscar cliente
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Nombre, teléfono o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Estado
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              >
                <option value="all">Todos</option>
                <option value="pending">Pendientes</option>
                <option value="confirmed">Confirmadas</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Fecha
              </label>
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>

            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('')
                  setStatusFilter('all')
                  setDateFilter('')
                }}
                className="w-full"
              >
                Limpiar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Reservas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Reservas ({filteredReservations.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredReservations.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {reservations.length === 0 ? 'No hay reservas' : 'No se encontraron reservas'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {reservations.length === 0 
                  ? 'Cuando los clientes hagan reservas, aparecerán aquí.'
                  : 'Intenta cambiar los filtros para ver más resultados.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReservations.map((reservation) => (
                <div 
                  key={reservation.id} 
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      {/* Header de la reserva */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            reservation.status === 'confirmed' ? 'bg-green-500' : 'bg-yellow-500'
                          }`}></div>
                          <h4 className="font-semibold text-gray-900 text-lg">
                            {reservation.client_name}
                          </h4>
                          {getStatusBadge(reservation.status)}
                        </div>
                        <div className="text-sm text-gray-500">
                          Creada: {new Date(reservation.created_at).toLocaleDateString('es-ES')}
                        </div>
                      </div>

                      {/* Detalles de la reserva */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="mr-2 h-4 w-4" />
                          <span className="font-medium">
                            {formatDateDisplay(reservation.selected_date)}
                          </span>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="mr-2 h-4 w-4" />
                          <span className="font-medium">{reservation.selected_time}</span>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="mr-2 h-4 w-4" />
                          <span>{reservation.client_phone}</span>
                        </div>
                        
                        {reservation.client_email && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail className="mr-2 h-4 w-4" />
                            <span className="truncate">{reservation.client_email}</span>
                          </div>
                        )}
                      </div>

                      {/* Servicios */}
                      <div className="mb-3">
                        <span className="text-sm font-medium text-gray-700">Servicios: </span>
                        <div className="inline-flex flex-wrap gap-1 mt-1">
                          {reservation.selected_services.map((serviceId, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {getServiceName(serviceId)}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Comentarios */}
                      {reservation.comments && (
                        <div className="mb-3">
                          <span className="text-sm font-medium text-gray-700">Comentarios: </span>
                          <p className="text-sm text-gray-600 italic">"{reservation.comments}"</p>
                        </div>
                      )}
                    </div>

                    {/* Acciones */}
                    <div className="flex flex-col gap-2 ml-4">
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
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditReservation(reservation)}
                      >
                        <Edit className="mr-1 h-3 w-3" />
                        Editar
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => deleteReservation(reservation.id, reservation.client_name)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="mr-1 h-3 w-3" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal para agregar reservas */}
      <AddReservationModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          fetchReservations()
        }}
      />

      {/* Modal para editar reservas */}
      <EditReservationModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedReservation(null)
        }}
        onSuccess={() => {
          fetchReservations()
        }}
        reservation={selectedReservation}
      />
    </div>
  )
}