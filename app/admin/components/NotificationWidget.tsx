'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Bell, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  X,
  Eye
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

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

interface Notification {
  id: string
  type: 'upcoming' | 'new' | 'reminder'
  title: string
  message: string
  reservation: Reservation
  timestamp: Date
  priority: 'low' | 'medium' | 'high'
}

export default function NotificationWidget() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    fetchReservations()
  }, [])

  useEffect(() => {
    generateNotifications()
  }, [reservations])

  const fetchReservations = async () => {
    try {
      const today = new Date()
      const tomorrow = new Date()
      tomorrow.setDate(today.getDate() + 1)

      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .gte('selected_date', today.toISOString().split('T')[0])
        .lte('selected_date', tomorrow.toISOString().split('T')[0])
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

  const generateNotifications = () => {
    const newNotifications: Notification[] = []
    const now = new Date()

    reservations.forEach(reservation => {
      const reservationDateTime = new Date(`${reservation.selected_date}T${reservation.selected_time}`)
      const timeDiff = reservationDateTime.getTime() - now.getTime()
      const minutesUntil = Math.floor(timeDiff / (1000 * 60))

      // Notificación de nueva reserva (últimas 24 horas)
      const createdAt = new Date(reservation.created_at)
      const hoursSinceCreated = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60)
      
      if (hoursSinceCreated <= 24) {
        newNotifications.push({
          id: `new-${reservation.id}`,
          type: 'new',
          title: 'Nueva Reserva',
          message: `${reservation.client_name} - ${reservation.selected_time}`,
          reservation,
          timestamp: createdAt,
          priority: 'medium'
        })
      }

      // Recordatorios de citas próximas (próximas 2 horas)
      if (minutesUntil > 0 && minutesUntil <= 120) {
        newNotifications.push({
          id: `upcoming-${reservation.id}`,
          type: 'upcoming',
          title: 'Cita Próxima',
          message: `${reservation.client_name} en ${Math.round(minutesUntil)} min`,
          reservation,
          timestamp: now,
          priority: minutesUntil <= 30 ? 'high' : 'medium'
        })
      }

      // Recordatorio urgente (próximos 30 minutos)
      if (minutesUntil > 0 && minutesUntil <= 30) {
        newNotifications.push({
          id: `reminder-${reservation.id}`,
          type: 'reminder',
          title: '¡Cita Muy Próxima!',
          message: `${reservation.client_name} en ${minutesUntil} minutos`,
          reservation,
          timestamp: now,
          priority: 'high'
        })
      }
    })

    // Ordenar por prioridad y tiempo
    const sortedNotifications = newNotifications.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      }
      return b.timestamp.getTime() - a.timestamp.getTime()
    })

    setNotifications(sortedNotifications.slice(0, 5)) // Máximo 5 notificaciones
  }

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'new': return <Bell className="h-4 w-4 text-blue-500" />
      case 'upcoming': return <Clock className="h-4 w-4 text-yellow-500" />
      case 'reminder': return <AlertTriangle className="h-4 w-4 text-red-500" />
      default: return <Bell className="h-4 w-4" />
    }
  }

  const getNotificationColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'high': return 'border-l-4 border-red-500 bg-red-50'
      case 'medium': return 'border-l-4 border-yellow-500 bg-yellow-50'
      case 'low': return 'border-l-4 border-blue-500 bg-blue-50'
      default: return 'border-l-4 border-gray-300 bg-gray-50'
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="mr-2 h-5 w-5" />
            Notificaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <div className="relative">
              <Bell className="mr-2 h-5 w-5" />
              {notifications.length > 0 && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {notifications.length}
                </div>
              )}
            </div>
            Notificaciones
          </CardTitle>
          <Link href="/admin/notifications">
            <Button variant="outline" size="sm">
              <Eye className="mr-2 h-4 w-4" />
              Ver todas
            </Button>
          </Link>
        </div>
        <CardDescription>
          Alertas y recordatorios importantes
        </CardDescription>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <CheckCircle className="mx-auto h-8 w-8 mb-2 text-green-500" />
            <p className="text-sm">No hay notificaciones pendientes</p>
            <p className="text-xs text-gray-400">Todo está al día</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg transition-all duration-200 ${getNotificationColor(notification.priority)}`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </h4>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          notification.priority === 'high' 
                            ? 'border-red-300 text-red-700 bg-red-50'
                            : notification.priority === 'medium'
                            ? 'border-yellow-300 text-yellow-700 bg-yellow-50'
                            : 'border-blue-300 text-blue-700 bg-blue-50'
                        }`}
                      >
                        {notification.priority === 'high' && 'Urgente'}
                        {notification.priority === 'medium' && 'Importante'}
                        {notification.priority === 'low' && 'Info'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-700 mb-1">
                      {notification.message}
                    </p>
                    <div className="flex items-center space-x-3 text-xs text-gray-500">
                      <span>{notification.reservation.selected_date}</span>
                      <span>•</span>
                      <span>{notification.reservation.client_phone}</span>
                      <span>•</span>
                      <span className="capitalize">{notification.reservation.status}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {notifications.length > 0 && (
          <div className="mt-4 pt-3 border-t">
            <Link href="/admin/notifications">
              <Button variant="ghost" className="w-full text-sm">
                Ver todas las notificaciones ({notifications.length}+)
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}