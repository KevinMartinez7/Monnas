'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { 
  Bell, 
  Clock, 
  User, 
  Phone, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  X,
  Settings,
  Volume2,
  VolumeX
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

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
  type: 'upcoming' | 'new' | 'reminder' | 'cancelled'
  title: string
  message: string
  reservation: Reservation
  timestamp: Date
  read: boolean
  priority: 'low' | 'medium' | 'high'
}

interface NotificationSettings {
  enabled: boolean
  newReservations: boolean
  upcomingReminders: boolean
  reminderMinutes: number
  sound: boolean
  desktop: boolean
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: true,
    newReservations: true,
    upcomingReminders: true,
    reminderMinutes: 30,
    sound: true,
    desktop: false
  })
  const [isLoading, setIsLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)

  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    loadSettings()
    fetchReservations()
    
    // Verificar notificaciones cada minuto
    const interval = setInterval(() => {
      checkForUpcomingReservations()
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    generateNotifications()
  }, [reservations])

  useEffect(() => {
    const unread = notifications.filter(n => !n.read).length
    setUnreadCount(unread)
  }, [notifications])

  const loadSettings = () => {
    const savedSettings = localStorage.getItem('notification-settings')
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }
  }

  const saveSettings = (newSettings: NotificationSettings) => {
    setSettings(newSettings)
    localStorage.setItem('notification-settings', JSON.stringify(newSettings))
    
    if (newSettings.desktop && 'Notification' in window) {
      Notification.requestPermission()
    }
  }

  const fetchReservations = async () => {
    try {
      const today = new Date()
      const tomorrow = new Date()
      tomorrow.setDate(today.getDate() + 7) // próximos 7 días

      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .gte('selected_date', today.toISOString().split('T')[0])
        .lte('selected_date', tomorrow.toISOString().split('T')[0])
        .order('selected_date', { ascending: true })
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
      
      if (hoursSinceCreated <= 24 && settings.newReservations) {
        newNotifications.push({
          id: `new-${reservation.id}`,
          type: 'new',
          title: 'Nueva Reserva',
          message: `${reservation.client_name} ha reservado para ${reservation.selected_date} a las ${reservation.selected_time}`,
          reservation,
          timestamp: createdAt,
          read: false,
          priority: 'medium'
        })
      }

      // Notificaciones de recordatorio
      if (settings.upcomingReminders && minutesUntil > 0) {
        if (minutesUntil <= settings.reminderMinutes && minutesUntil > settings.reminderMinutes - 5) {
          newNotifications.push({
            id: `reminder-${reservation.id}`,
            type: 'reminder',
            title: 'Recordatorio de Cita',
            message: `Cita con ${reservation.client_name} en ${minutesUntil} minutos`,
            reservation,
            timestamp: now,
            read: false,
            priority: 'high'
          })
        }

        // Cita del día (mañana)
        if (minutesUntil <= 24 * 60 && minutesUntil > 23 * 60) {
          newNotifications.push({
            id: `upcoming-${reservation.id}`,
            type: 'upcoming',
            title: 'Cita de Hoy',
            message: `Tienes una cita con ${reservation.client_name} a las ${reservation.selected_time}`,
            reservation,
            timestamp: now,
            read: false,
            priority: 'medium'
          })
        }
      }

      // Citas atrasadas
      if (minutesUntil < -15 && reservation.status === 'pending') {
        newNotifications.push({
          id: `late-${reservation.id}`,
          type: 'cancelled',
          title: 'Cita Atrasada',
          message: `La cita con ${reservation.client_name} debía ser a las ${reservation.selected_time}`,
          reservation,
          timestamp: now,
          read: false,
          priority: 'high'
        })
      }
    })

    // Evitar duplicados y ordenar por prioridad y tiempo
    const uniqueNotifications = newNotifications.filter((notif, index, self) => 
      index === self.findIndex(t => t.id === notif.id)
    )

    const sortedNotifications = uniqueNotifications.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      }
      return b.timestamp.getTime() - a.timestamp.getTime()
    })

    setNotifications(sortedNotifications)
  }

  const checkForUpcomingReservations = () => {
    if (!settings.enabled) return
    
    const now = new Date()
    reservations.forEach(reservation => {
      const reservationDateTime = new Date(`${reservation.selected_date}T${reservation.selected_time}`)
      const minutesUntil = Math.floor((reservationDateTime.getTime() - now.getTime()) / (1000 * 60))

      if (minutesUntil === settings.reminderMinutes) {
        showNotification(
          'Recordatorio de Cita',
          `Cita con ${reservation.client_name} en ${minutesUntil} minutos`
        )
      }
    })
  }

  const showNotification = (title: string, body: string) => {
    if (settings.sound) {
      // Simular sonido de notificación
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwgBjuS1/LngyMFl')
      audio.play().catch(() => {})
    }

    if (settings.desktop && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/images/monnas-logo2.png' })
    }

    toast({
      title,
      description: body,
      duration: 5000,
    })
  }

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })))
  }

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId))
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

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'new': return <User className="h-4 w-4" />
      case 'upcoming': return <Clock className="h-4 w-4" />
      case 'reminder': return <Bell className="h-4 w-4" />
      case 'cancelled': return <AlertTriangle className="h-4 w-4" />
      default: return <Bell className="h-4 w-4" />
    }
  }

  const getNotificationColor = (type: Notification['type'], priority: Notification['priority']) => {
    if (priority === 'high') return 'bg-red-100 border-red-300 text-red-800'
    if (priority === 'medium') return 'bg-yellow-100 border-yellow-300 text-yellow-800'
    return 'bg-blue-100 border-blue-300 text-blue-800'
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Bell className="h-8 w-8 text-pink-600" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 min-w-[1.2rem] h-5 flex items-center justify-center rounded-full">
                {unreadCount}
              </Badge>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Centro de Notificaciones</h1>
            <p className="text-gray-600">
              Alertas y recordatorios de reservas
            </p>
          </div>
        </div>
        
        {unreadCount > 0 && (
          <Button variant="outline" onClick={markAllAsRead}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Marcar todo como leído
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuración de Notificaciones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="mr-2 h-5 w-5" />
              Configuración
            </CardTitle>
            <CardDescription>
              Personaliza tus alertas y recordatorios
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">Notificaciones</label>
                <p className="text-xs text-muted-foreground">Activar/desactivar todas las notificaciones</p>
              </div>
              <Switch
                checked={settings.enabled}
                onCheckedChange={(checked) => saveSettings({ ...settings, enabled: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">Nuevas Reservas</label>
                <p className="text-xs text-muted-foreground">Alertas para reservas recientes</p>
              </div>
              <Switch
                checked={settings.newReservations}
                onCheckedChange={(checked) => saveSettings({ ...settings, newReservations: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">Recordatorios</label>
                <p className="text-xs text-muted-foreground">Alertas antes de las citas</p>
              </div>
              <Switch
                checked={settings.upcomingReminders}
                onCheckedChange={(checked) => saveSettings({ ...settings, upcomingReminders: checked })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Recordar con:</label>
              <select 
                className="w-full p-2 border rounded-md text-sm"
                value={settings.reminderMinutes}
                onChange={(e) => saveSettings({ ...settings, reminderMinutes: parseInt(e.target.value) })}
              >
                <option value={15}>15 minutos antes</option>
                <option value={30}>30 minutos antes</option>
                <option value={60}>1 hora antes</option>
                <option value={120}>2 horas antes</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5 flex items-center">
                {settings.sound ? <Volume2 className="mr-2 h-4 w-4" /> : <VolumeX className="mr-2 h-4 w-4" />}
                <div>
                  <label className="text-sm font-medium">Sonido</label>
                  <p className="text-xs text-muted-foreground">Reproducir sonido de alerta</p>
                </div>
              </div>
              <Switch
                checked={settings.sound}
                onCheckedChange={(checked) => saveSettings({ ...settings, sound: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">Notificaciones del Sistema</label>
                <p className="text-xs text-muted-foreground">Mostrar en el escritorio</p>
              </div>
              <Switch
                checked={settings.desktop}
                onCheckedChange={(checked) => saveSettings({ ...settings, desktop: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Lista de Notificaciones */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Notificaciones Activas</CardTitle>
            <CardDescription>
              {notifications.length === 0 ? 'No hay notificaciones' : `${notifications.length} notificación${notifications.length !== 1 ? 'es' : ''}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">No hay notificaciones activas</p>
                <p className="text-sm text-gray-400 mt-1">Las nuevas alertas aparecerán aquí</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border transition-all duration-200 ${
                      notification.read 
                        ? 'bg-gray-50 border-gray-200 opacity-75' 
                        : getNotificationColor(notification.type, notification.priority)
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="text-sm font-medium">{notification.title}</h4>
                            <Badge variant="outline" className="text-xs">
                              {notification.type === 'new' && 'Nueva'}
                              {notification.type === 'upcoming' && 'Próxima'}
                              {notification.type === 'reminder' && 'Recordatorio'}
                              {notification.type === 'cancelled' && 'Atrasada'}
                            </Badge>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                          <p className="text-sm text-gray-700 mb-2">{notification.message}</p>
                          
                          <div className="text-xs text-gray-500 space-y-1">
                            <div className="flex items-center space-x-4">
                              <span className="flex items-center">
                                <Phone className="mr-1 h-3 w-3" />
                                {notification.reservation.client_phone}
                              </span>
                              <span className="flex items-center">
                                <Calendar className="mr-1 h-3 w-3" />
                                {notification.reservation.selected_date}
                              </span>
                              <span className="flex items-center">
                                <Clock className="mr-1 h-3 w-3" />
                                {notification.reservation.selected_time}
                              </span>
                            </div>
                            <div>
                              <strong>Servicios:</strong> {notification.reservation.selected_services.map(getServiceName).join(', ')}
                            </div>
                            <div className="text-gray-400">
                              {notification.timestamp.toLocaleString('es-ES')}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-2">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                            className="h-6 w-6 p-0"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNotification(notification.id)}
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Próximas 2 horas</p>
                <p className="text-2xl font-bold text-blue-600">
                  {reservations.filter(r => {
                    const now = new Date()
                    const reservationTime = new Date(`${r.selected_date}T${r.selected_time}`)
                    const diffMinutes = (reservationTime.getTime() - now.getTime()) / (1000 * 60)
                    return diffMinutes > 0 && diffMinutes <= 120
                  }).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Hoy</p>
                <p className="text-2xl font-bold text-green-600">
                  {reservations.filter(r => r.selected_date === new Date().toISOString().split('T')[0]).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {reservations.filter(r => r.status === 'pending').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-pink-500" />
              <div>
                <p className="text-sm font-medium">Sin leer</p>
                <p className="text-2xl font-bold text-pink-600">{unreadCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}