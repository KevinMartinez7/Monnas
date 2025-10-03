'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { X, Calendar, Clock, User, Phone, Mail, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface AddReservationModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function AddReservationModal({ isOpen, onClose, onSuccess }: AddReservationModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [bookedTimes, setBookedTimes] = useState<string[]>([])
  const [clientData, setClientData] = useState({
    name: '',
    email: '',
    phone: '',
    comments: ''
  })
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')

  const supabase = createClient()
  const { toast } = useToast()

  const availableServices = [
    { id: "cosmetologia", name: "Cosmetología" },
    { id: "cejas-pestanas", name: "Cejas & Pestañas" },
    { id: "tricologia", name: "Tricología Facial" },
    { id: "depilacion-laser", name: "Depilación Láser" },
    { id: "cuidados-personalizados", name: "Cuidados Personalizados" },
    { id: "masajes", name: "Masajes" },
  ]

  const availableTimes = [
    "09:00", "10:00", "11:00",
    "14:00", "15:00", "16:00", 
    "17:00", "18:00", "19:00", "20:00"
  ]

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    )
  }

  const handleClientDataChange = (field: string, value: string) => {
    setClientData(prev => ({ ...prev, [field]: value }))
  }

  const resetForm = () => {
    setClientData({ name: '', email: '', phone: '', comments: '' })
    setSelectedServices([])
    setSelectedDate('')
    setSelectedTime('')
    setBookedTimes([])
  }

  // Verificar horarios ocupados cuando cambia la fecha
  const checkBookedTimes = async (date: string) => {
    if (!date) return

    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('selected_time')
        .eq('selected_date', date)

      if (error) {
        console.error('Error checking booked times:', error)
        return
      }

      const times = data?.map(r => r.selected_time) || []
      setBookedTimes(times)

    } catch (error) {
      console.error('Error in checkBookedTimes:', error)
    }
  }

  // Ejecutar cuando cambia la fecha seleccionada
  useEffect(() => {
    if (selectedDate) {
      checkBookedTimes(selectedDate)
    }
  }, [selectedDate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const reservationData = {
        client_name: clientData.name,
        client_email: clientData.email || null,
        client_phone: clientData.phone,
        selected_date: selectedDate,
        selected_time: selectedTime,
        selected_services: selectedServices,
        comments: clientData.comments || null,
        status: 'confirmed' // Las reservas manuales se marcan como confirmadas automáticamente
      }

      const { error } = await supabase
        .from('reservations')
        .insert([reservationData])

      if (error) {
        console.error('Error creating reservation:', error)
        toast({
          title: "Error al crear reserva",
          description: "No se pudo crear la reserva. Intenta nuevamente.",
          variant: "destructive",
          duration: 5000,
        })
        return
      }

      // Éxito
      toast({
        title: "¡Reserva creada!",
        description: `La reserva para ${clientData.name} ha sido creada exitosamente.`,
        duration: 5000,
      })
      resetForm()
      onSuccess()
      onClose()

    } catch (error) {
      console.error('Error in handleSubmit:', error)
      toast({
        title: "Error inesperado",
        description: "Ocurrió un error inesperado. Intenta nuevamente.",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const isFormValid = 
    clientData.name && 
    clientData.phone && 
    selectedDate && 
    selectedTime && 
    selectedServices.length > 0

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-xl font-semibold">Nueva Reserva Manual</CardTitle>
            <CardDescription>
              Agregar reserva para cliente que llamó por teléfono
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Datos del Cliente */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Datos del Cliente
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                    Nombre completo *
                  </Label>
                  <Input
                    id="name"
                    value={clientData.name}
                    onChange={(e) => handleClientDataChange("name", e.target.value)}
                    placeholder="Nombre del cliente"
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                    Teléfono *
                  </Label>
                  <Input
                    id="phone"
                    value={clientData.phone}
                    onChange={(e) => handleClientDataChange("phone", e.target.value)}
                    placeholder="Número de teléfono"
                    className="mt-1"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email (opcional)
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={clientData.email}
                    onChange={(e) => handleClientDataChange("email", e.target.value)}
                    placeholder="email@ejemplo.com"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Selección de Servicios */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Servicios *</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableServices.map((service) => {
                  const isSelected = selectedServices.includes(service.id)
                  return (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => handleServiceToggle(service.id)}
                      className={`
                        p-3 rounded-lg border-2 transition-all duration-200 text-left flex items-center justify-between
                        ${
                          isSelected
                            ? "border-pink-500 bg-pink-50 text-pink-700"
                            : "border-gray-200 bg-white text-gray-700 hover:border-pink-300 hover:bg-pink-50"
                        }
                      `}
                    >
                      <span className="font-medium">{service.name}</span>
                      {isSelected && <Check className="h-4 w-4" />}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Fecha y Hora */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Fecha y Hora *
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date" className="text-sm font-medium text-gray-700">
                    Fecha
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="mt-1"
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="time" className="text-sm font-medium text-gray-700">
                    Hora {selectedDate && bookedTimes.length > 0 && (
                      <span className="text-xs text-yellow-600">
                        ({bookedTimes.length} horarios ocupados)
                      </span>
                    )}
                  </Label>
                  <div className="mt-1 grid grid-cols-2 gap-2">
                    {availableTimes.map((time) => {
                      const isBooked = bookedTimes.includes(time)
                      const isSelected = selectedTime === time
                      
                      return (
                        <button
                          key={time}
                          type="button"
                          onClick={() => !isBooked && setSelectedTime(time)}
                          disabled={isBooked}
                          className={`
                            px-3 py-2 text-sm rounded-md border transition-all duration-200 text-center
                            ${isBooked 
                              ? 'bg-red-100 text-red-600 border-red-300 cursor-not-allowed opacity-60' 
                              : isSelected
                                ? 'bg-pink-500 text-white border-pink-500'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-pink-300 hover:bg-pink-50'
                            }
                          `}
                        >
                          {time}
                          {isBooked && <div className="text-xs">Ocupado</div>}
                        </button>
                      )
                    })}
                  </div>
                  {selectedDate && bookedTimes.length > 0 && (
                    <p className="mt-2 text-xs text-gray-500">
                      💡 Los horarios en rojo ya están reservados para esta fecha
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Comentarios */}
            <div>
              <Label htmlFor="comments" className="text-sm font-medium text-gray-700">
                Comentarios adicionales (opcional)
              </Label>
              <Textarea
                id="comments"
                value={clientData.comments}
                onChange={(e) => handleClientDataChange("comments", e.target.value)}
                placeholder="Notas especiales, observaciones, etc."
                className="mt-1"
                rows={3}
              />
            </div>

            {/* Resumen */}
            {isFormValid && (
              <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                <h5 className="font-medium text-pink-800 mb-2">Resumen de la Reserva:</h5>
                <div className="text-sm text-pink-700 space-y-1">
                  <p><strong>Cliente:</strong> {clientData.name}</p>
                  <p><strong>Teléfono:</strong> {clientData.phone}</p>
                  <p><strong>Fecha:</strong> {new Date(selectedDate).toLocaleDateString('es-ES', { 
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                  })}</p>
                  <p><strong>Hora:</strong> {selectedTime}</p>
                  <p><strong>Servicios:</strong> {selectedServices.map(id => 
                    availableServices.find(s => s.id === id)?.name
                  ).join(', ')}</p>
                  {clientData.comments && (
                    <p><strong>Comentarios:</strong> {clientData.comments}</p>
                  )}
                </div>
                <Badge className="mt-2 bg-green-100 text-green-800">
                  Estado: Confirmada (reserva manual)
                </Badge>
              </div>
            )}

            {/* Botones */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                type="submit"
                disabled={!isFormValid || isLoading}
                className="flex-1 bg-pink-500 hover:bg-pink-600 text-white"
              >
                {isLoading ? 'Guardando...' : 'Crear Reserva'}
              </Button>
              <Button 
                type="button"
                variant="outline" 
                onClick={onClose} 
                className="flex-1"
                disabled={isLoading}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}