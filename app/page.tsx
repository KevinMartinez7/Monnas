"use client"

import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  Star,
  Sparkles,
  Eye,
  Scissors,
  Zap,
  Menu,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Image from "next/image"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import Autoplay from "embla-carousel-autoplay"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488" />
  </svg>
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

export default function MonnasLanding() {
  const [showCalendar, setShowCalendar] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [showMapModal, setShowMapModal] = useState(false)

  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [clientData, setClientData] = useState({
    name: "",
    email: "",
    phone: "",
    comments: "",
  })

  const [bookedAppointments, setBookedAppointments] = useState<{ [key: string]: string[] }>({})
  const [isLoading, setIsLoading] = useState(false)

  const supabase = createClient()

  const fetchReservations = async () => {
    try {
      const { data: reservations, error } = await supabase
        .from("reservations")
        .select("selected_date, selected_time")
        .eq("status", "pending")

      if (error) {
        console.error("Error fetching reservations:", error)
        return
      }

      const bookedMap: { [key: string]: string[] } = {}
      reservations?.forEach((reservation: any) => {
        const dateKey = reservation.selected_date
        if (!bookedMap[dateKey]) {
          bookedMap[dateKey] = []
        }
        bookedMap[dateKey].push(reservation.selected_time)
      })

      setBookedAppointments(bookedMap)
    } catch (error) {
      console.error("Error in fetchReservations:", error)
    }
  }

  useEffect(() => {
    fetchReservations()
  }, [])

  const saveReservation = async (reservationData: {
    client_name: string
    client_email: string
    client_phone: string
    selected_date: string
    selected_time: string
    selected_services: string[]
    comments: string
  }) => {
    try {
      const { data, error } = await supabase.from("reservations").insert([reservationData]).select()

      if (error) {
        console.error("Error saving reservation:", error)
        throw error
      }

      return data[0]
    } catch (error) {
      console.error("Error in saveReservation:", error)
      throw error
    }
  }

  const availableTimes = [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
    "18:00",
    "18:30",
  ]

  const availableServices = [
    { id: "cosmetologia", name: "Cosmetología", icon: Sparkles },
    { id: "cejas-pestanas", name: "Cejas & Pestañas", icon: Eye },
    { id: "tricologia", name: "Tricología Facial", icon: Scissors },
    { id: "depilacion-laser", name: "Depilación Láser", icon: Zap },
    { id: "cuidados-personalizados", name: "Cuidados Personalizados", icon: Star },
    { id: "consulta", name: "Consulta", icon: Clock },
  ]

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    const days = []
    const currentDate = new Date(startDate)

    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return days
  }

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    setSelectedTime(null)
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
  }

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId],
    )
  }

  const handleClientDataChange = (field: string, value: string) => {
    setClientData((prev) => ({ ...prev, [field]: value }))
  }

  const isDateSelected = (date: Date) => {
    if (!selectedDate) return false
    return date.toDateString() === selectedDate.toDateString()
  }

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth.getMonth()
  }

  const navigateMonth = (direction: "prev" | "next") => {
    const newMonth = new Date(currentMonth)
    if (direction === "prev") {
      newMonth.setMonth(newMonth.getMonth() - 1)
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1)
    }
    setCurrentMonth(newMonth)
  }

  const openCalendar = () => {
    setShowCalendar(true)
  }

  const closeCalendar = () => {
    setShowCalendar(false)
    setSelectedDate(null)
    setSelectedTime(null)
    setSelectedServices([])
    setClientData({ name: "", email: "", phone: "", comments: "" })
  }

  const handleConfirmReservation = async () => {
    if (!selectedDate || !selectedTime || selectedServices.length === 0 || !clientData.name || !clientData.phone) {
      return
    }

    setIsLoading(true)

    try {
      const reservationData = {
        client_name: clientData.name,
        client_email: clientData.email,
        client_phone: clientData.phone,
        selected_date: selectedDate.toISOString().split("T")[0],
        selected_time: selectedTime,
        selected_services: selectedServices,
        comments: clientData.comments,
      }

      await saveReservation(reservationData)

      await fetchReservations()

      const serviceNames = selectedServices
        .map((serviceId) => availableServices.find((service) => service.id === serviceId)?.name)
        .join(", ")

      const message = `🌸 *NUEVA RESERVA - MONNAS ESTÉTICA* 🌸

👤 *Cliente:* ${clientData.name}
📞 *Teléfono:* ${clientData.phone}
📧 *Email:* ${clientData.email || "No proporcionado"}

📅 *Fecha:* ${selectedDate.toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })}
🕐 *Hora:* ${selectedTime}

💅 *Servicios solicitados:*
${serviceNames}

💬 *Comentarios adicionales:*
${clientData.comments || "Ninguno"}

_Reserva realizada desde la web_`

      const encodedMessage = encodeURIComponent(message)
      const whatsappUrl = `https://wa.me/5492494245650?text=${encodedMessage}`

      window.open(whatsappUrl, "_blank")

      setShowCalendar(false)
      setShowSuccessPopup(true)
      setSelectedDate(null)
      setSelectedTime(null)
      setSelectedServices([])
      setClientData({ name: "", email: "", phone: "", comments: "" })
    } catch (error) {
      console.error("Error confirming reservation:", error)
      alert("Error al guardar la reserva. Por favor, intenta nuevamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const closeSuccessPopup = () => {
    setShowSuccessPopup(false)
  }

  const openMapModal = () => {
    setShowMapModal(true)
  }

  const closeMapModal = () => {
    setShowMapModal(false)
  }

  const isFormComplete =
    selectedDate && selectedTime && selectedServices.length > 0 && clientData.name && clientData.phone

 const formatDate = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

const isDateBooked = (date: Date) => {
  const dateKey = formatDate(date)
  return bookedAppointments[dateKey]?.length > 0
}

const formatTime = (time: string) => {
  // Si viene con segundos, lo recortamos a HH:mm
  return time.slice(0, 5);
}

const isTimeBooked = (date: Date, time: string) => {
  const dateKey = formatDate(date);
  const bookedTimes = bookedAppointments[dateKey] || [];
  return bookedTimes.some(bookedTime => formatTime(bookedTime) === time);
}


const getAvailableTimesForDate = (date: Date) => {
  const dateKey = formatDate(date)
  const bookedTimes = bookedAppointments[dateKey] || []
  return availableTimes.filter((time) => !bookedTimes.includes(time))
}

const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

const toggleMobileMenu = () => setMobileMenuOpen((prev) => !prev)



  return (
    <div
      className="min-h-screen"
      style={{
        background: "linear-gradient(to right, #bdc3c7 0%, #2c3e50 100%)",
      }}
    >
      {showMapModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-pink-400 to-pink-600">
              <h3 className="text-lg font-semibold text-white">Ubicación - Monnas Estética</h3>
              <Button variant="ghost" size="sm" onClick={closeMapModal} className="text-pink-100 hover:text-white">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4">
              <div className="mb-4">
                <p className="text-gray-700 mb-2">
                  <MapPin className="h-4 w-4 inline mr-2" />
                  Saavedra 841, Tandil, Buenos Aires
                </p>
              </div>
              <div className="w-full h-96 rounded-lg overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3173.0680889856308!2d-59.1219358!3d-37.317214799999995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95911f175284782b%3A0xcb9b272f68c44cc4!2sMonnas%20Estetica!5e0!3m2!1ses!2sar!4v1756856954358!5m2!1ses!2sar"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6 text-center">
            <div className="mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">¡Reserva Exitosa!</h3>
              <p className="text-gray-600">
                Tu reserva ha sido enviada por WhatsApp. Nos pondremos en contacto contigo para confirmar los detalles.
              </p>
            </div>
            <Button onClick={closeSuccessPopup} className="w-full bg-pink-500 hover:bg-pink-600 text-white">
              Cerrar
            </Button>
          </div>
        </div>
      )}

      {showCalendar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 pt-20">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-pink-400 to-pink-600">
              <h3 className="text-lg font-semibold text-white">Reservar Turno</h3>
              <Button variant="ghost" size="sm" onClick={closeCalendar} className="text-pink-100 hover:text-white">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-6 space-y-6">
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
                      placeholder="Tu nombre completo"
                      className="mt-1"
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
                      placeholder="Tu número de teléfono"
                      className="mt-1"
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
                      placeholder="tu@email.com"
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
                    const IconComponent = service.icon
                    const isSelected = selectedServices.includes(service.id)
                    return (
                      <button
                        key={service.id}
                        onClick={() => handleServiceToggle(service.id)}
                        className={`
                          p-3 rounded-lg border-2 transition-all duration-200 text-left flex items-center space-x-3
                          ${
                            isSelected
                              ? "border-pink-500 bg-pink-50 text-pink-700"
                              : "border-gray-200 bg-white text-gray-700 hover:border-pink-300 hover:bg-pink-50"
                          }
                        `}
                      >
                        <IconComponent className="h-5 w-5" />
                        <span className="font-medium">{service.name}</span>
                        {isSelected && <Check className="h-4 w-4 ml-auto" />}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Calendario */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Fecha y Hora *
                </h4>

                <div className="flex items-center justify-between mb-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigateMonth("prev")}
                    className="text-gray-600 hover:text-black"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <h5 className="text-lg font-medium text-black">
                    {currentMonth.toLocaleDateString("es-ES", { month: "long", year: "numeric" })}
                  </h5>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigateMonth("next")}
                    className="text-gray-600 hover:text-black"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-2">
                  {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
                    <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1 mb-4">
                  {generateCalendarDays().map((date, index) => {
                    const hasBookedAppointments = isDateBooked(date)
                    const availableTimesCount = getAvailableTimesForDate(date).length

                    return (
                      <button
                        key={index}
                        onClick={() => handleDateSelect(date)}
                        className={`
                          p-2 text-sm rounded-md transition-all duration-200 hover:bg-gray-100 relative
                          ${!isCurrentMonth(date) ? "text-gray-300" : "text-black"}
                          ${isDateSelected(date) ? "bg-pink-500 text-white hover:bg-pink-600" : ""}
                          ${hasBookedAppointments && availableTimesCount === 0 ? "bg-red-100 text-red-600 cursor-not-allowed" : ""}
                          ${hasBookedAppointments && availableTimesCount > 0 ? "bg-orange-50 border border-orange-200" : ""}
                        `}
                        disabled={hasBookedAppointments && availableTimesCount === 0}
                      >
                        {date.getDate()}
                        {hasBookedAppointments && (
                          <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-red-500"></div>
                        )}
                      </button>
                    )
                  })}
                </div>

                {selectedDate && (
                  <div className="mb-4 p-3 bg-pink-50 rounded-md border border-pink-200">
                    <p className="text-sm text-pink-800 mb-2">
                      Fecha seleccionada:{" "}
                      {selectedDate.toLocaleDateString("es-ES", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>

                    <div className="mt-3">
                      <div className="flex items-center mb-2">
                        <Clock className="h-4 w-4 mr-2 text-pink-600" />
                        <span className="text-sm font-medium text-pink-800">Selecciona una hora:</span>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {availableTimes.map((time) => {
                          const isBooked = isTimeBooked(selectedDate, time)
                          return (
                            <button
                              key={time}
                              onClick={() => !isBooked && handleTimeSelect(time)}
                              disabled={isBooked}
                              className={`
                                px-3 py-2 text-xs rounded-md border transition-all duration-200
                                ${
                                  isBooked
                                    ? "bg-red-100 text-red-600 border-red-300 cursor-not-allowed opacity-60"
                                    : selectedTime === time
                                      ? "bg-pink-500 text-white border-pink-500"
                                      : "bg-white text-gray-700 border-gray-300 hover:border-pink-300 hover:bg-pink-50"
                                }
                              `}
                            >
                              {time}
                              {isBooked && <span className="block text-xs">Ocupado</span>}
                            </button>
                          )
                        })}
                      </div>

                      {selectedTime && <p className="text-xs text-pink-700 mt-2">Hora seleccionada: {selectedTime}</p>}

                      {isDateBooked(selectedDate) && (
                        <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded text-xs text-orange-700">
                          ⚠️ Esta fecha tiene algunos horarios ocupados. Los horarios en rojo no están disponibles.
                        </div>
                      )}
                    </div>
                  </div>
                )}
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
                  placeholder="Algún detalle especial o consulta..."
                  className="mt-1"
                  rows={3}
                />
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  onClick={handleConfirmReservation}
                  className="flex-1 bg-pink-500 hover:bg-pink-600 text-white"
                  disabled={!isFormComplete || isLoading}
                >
                  <WhatsAppIcon className="h-4 w-4 mr-2" />
                  {isLoading ? "Guardando..." : "Enviar Reserva por WhatsApp"}
                </Button>
                <Button variant="outline" onClick={closeCalendar} className="flex-1 bg-transparent">
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <header className="border-b border-gray-200 backdrop-blur-md sticky top-0 z-50 shadow-sm bg-gradient-to-r from-black to-gray-800">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Image src="/images/monnas-logo2.png" alt="Monnas Logo" width={40} height={40} className="rounded-full" />
              <h1 className="text-2xl font-bold text-white">Monnas</h1>
            </div>

            <nav className="hidden md:flex items-center space-x-8">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  window.scrollTo({ top: 0, behavior: "smooth" })
                }}
                className="text-gray-200 hover:text-white transition-all duration-300 font-medium relative group hover:-translate-y-1 transform cursor-pointer"
              >
                Home
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a
                href="#galeria"
                className="text-gray-200 hover:text-white transition-all duration-300 font-medium relative group hover:-translate-y-1 transform"
              >
                Galeria
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a
                href="#nosotros"
                className="text-gray-200 hover:text-white transition-all duration-300 font-medium relative group hover:-translate-y-1 transform"
              >
                Nosotros
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a
                href="#servicios"
                className="text-gray-200 hover:text-white transition-all duration-300 font-medium relative group hover:-translate-y-1 transform"
              >
                Servicios
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a
                href="#contacto"
                className="text-gray-200 hover:text-white transition-all duration-300 font-medium relative group hover:-translate-y-1 transform"
              >
                Contacto
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
              </a>
            </nav>

            <div className="flex items-center space-x-4">
              <Button
                onClick={openCalendar}
                className="bg-white hover:bg-gray-100 text-black px-6 py-2 rounded-full transition-all duration-300 hover:shadow-lg hover:scale-105 transform"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Reservar Turno
              </Button>

              <Button
  variant="ghost"
  size="sm"
  className="md:hidden text-white hover:text-gray-200 transition-all duration-200 hover:scale-110 transform"
  onClick={toggleMobileMenu}
>
  {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
</Button>

            </div>
          </div>
        </div>
      </header>
      
      {mobileMenuOpen && (
        <nav className="md:hidden fixed top-0 left-0 w-full h-full bg-black bg-opacity-90 flex flex-col items-center justify-center space-y-8 z-40">
          {["Home", "Galeria", "Nosotros", "Servicios", "Contacto"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              onClick={(e) => {
                e.preventDefault()
                window.scrollTo({ top: document.getElementById(item.toLowerCase())?.offsetTop || 0, behavior: "smooth" })
                setMobileMenuOpen(false)
              }}
              className="text-white text-2xl font-semibold hover:text-pink-400 transition-all duration-200"
            >
              {item}
            </a>
          ))}
        </nav>
      )}

      <section className="py-24 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="mb-8">
            <Badge variant="secondary" className="mb-4 text-sm px-4 py-2 bg-black text-white">
              ✨ Centro de Belleza Profesional
            </Badge>
            <h2 className="text-5xl md:text-6xl font-bold text-black mb-6 text-balance">
              Realza tu belleza natural en
              <span className="text-black"> Monnas</span>
            </h2>
            <p className="text-xl text-black mb-8 text-pretty max-w-2xl mx-auto">
              Especialistas en cosmetología, cejas, pestañas, tricología facial y depilación láser. Cuidados
              personalizados para resaltar tu belleza única.
            </p>
          </div>

          {/* <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              onClick={openCalendar}
              size="lg"
              className="bg-black hover:bg-gray-800 text-white text-lg px-8 py-6"
            >
              <Calendar className="h-5 w-5 mr-2" />
              Reservar Consulta
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-lg px-8 py-6 bg-white border-black text-black hover:bg-black hover:text-white"
            >
              <Phone className="h-5 w-5 mr-2" />
              Contactar
            </Button>
          </div> */}

          <div className="flex items-center justify-center text-black">
            <MapPin className="h-4 w-4 mr-2" />
            <span>Saavedra 841, Tandil, Buenos Aires</span>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-gray-50" id="galeria">
  <div className="container mx-auto max-w-6xl">
    <h3 className="text-3xl font-bold text-black text-center mb-8">
      Galería
    </h3>

    <Carousel
      className="w-full max-w-5xl mx-auto"
      opts={{ loop: true }}
      plugins={[
        Autoplay({
          delay: 4000, // cambia cada 4 segundos
        }),
      ]}
    >
      <CarouselContent>
        <CarouselItem>
          <img
            src="/images/carrusel1.png"
            alt="Imagen 1"
            className="w-full h-150 object-cover rounded-2xl shadow-md transition-transform duration-500 hover:scale-105"
          />
        </CarouselItem>
        <CarouselItem>
          <img
            src="/images/carrusel2.png"
            alt="Imagen 2"
            className="w-full h-150 object-cover rounded-2xl shadow-md transition-transform duration-500 hover:scale-105"
          />
        </CarouselItem>
        <CarouselItem>
          <img
            src="/images/carrusel3.png"
            alt="Imagen 3"
            className="w-full h-150 object-cover rounded-2xl shadow-md transition-transform duration-500 hover:scale-105"
          />
        </CarouselItem>
        <CarouselItem>
          <img
            src="/images/carrusel4.png"
            alt="Imagen 3"
            className="w-full h-150 object-cover rounded-2xl shadow-md transition-transform duration-500 hover:scale-105"
          />
        </CarouselItem>
        <CarouselItem>
          <img
            src="/images/carrusel5.png"
            alt="Imagen 3"
            className="w-full h-150 object-cover rounded-2xl shadow-md transition-transform duration-500 hover:scale-105"
          />
        </CarouselItem>
        <CarouselItem>
          <img
            src="/images/carrusel6.png"
            alt="Imagen 3"
            className="w-full h-150 object-cover rounded-2xl shadow-md transition-transform duration-500 hover:scale-105"
          />
        </CarouselItem>
        <CarouselItem>
          <img
            src="/images/carrusel7.png"
            alt="Imagen 3"
            className="w-full h-150 object-cover rounded-2xl shadow-md transition-transform duration-500 hover:scale-105"
          />
        </CarouselItem>
      </CarouselContent>

      <CarouselPrevious className="left-2 bg-white/80 hover:bg-white rounded-full shadow-md" />
      <CarouselNext className="right-2 bg-white/80 hover:bg-white rounded-full shadow-md" />
    </Carousel>
  </div>
</section>


      <section className="py-16 px-4 bg-white" id="nosotros">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="mb-12">
            <h3 className="text-3xl font-bold text-black mb-8">Nosotros</h3>
            <Card
              className="max-w-4xl mx-auto border border-gray-200 shadow-lg"
              style={{ background: "linear-gradient(to right, #bdc3c7 0%, #2c3e50 100%)" }}
            >
              <CardContent className="p-8">
                <div className="text-left space-y-6 text-white leading-relaxed">
                  <p className="text-xl font-semibold text-center">✨ La historia de Monnas ✨</p>

                  <p className="text-gray-100">
                    Monnas nació en 2022 con un sueño muy claro: crear un espacio donde la belleza y el bienestar se
                    encuentren en perfecta armonía. Lo que comenzó como un pequeño proyecto, inspirado en la pasión por
                    el cuidado personal y el deseo de ofrecer experiencias únicas, pronto se convirtió en un refugio
                    para quienes buscan sentirse y verse mejor cada día.
                  </p>

                  <p className="text-gray-100">
                    Desde el principio, Monnas se pensó como más que una estética. Quisimos que cada detalle —desde la
                    ambientación hasta la atención personalizada— transmita calidez, confianza y dedicación. Creemos que
                    la verdadera belleza se potencia cuando nos sentimos cómodos con nosotros mismos, por eso trabajamos
                    con técnicas innovadoras, productos de calidad y un equipo humano que escucha, entiende y acompaña.
                  </p>

                  <p className="text-gray-100">
                    En poco tiempo, Monnas se transformó en un lugar elegido por muchas personas que no solo buscan
                    tratamientos estéticos, sino también un momento para ellas mismas: un respiro, un mimo y una
                    experiencia que renueva por dentro y por fuera.
                  </p>

                  <p className="text-gray-100">
                    Hoy seguimos creciendo, siempre fieles a la idea que nos dio origen: resaltar tu belleza natural y
                    ayudarte a brillar con confianza en cada etapa de tu vida.
                  </p>

                  <p className="text-center font-semibold text-xl text-white">
                    🌸 Monnas, donde tu bienestar es nuestra inspiración. 🌸
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-gradient-to-r from-gray-50 to-white" id="servicios">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-black mb-4">Nuestros Servicios</h3>
            <p className="text-gray-600 text-lg">Tratamientos especializados con la más alta calidad</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card
              className="hover:shadow-xl hover:-translate-y-2 transition-all duration-300 ease-out border border-gray-200 group"
              style={{ background: "linear-gradient(to right, #bdc3c7 0%, #2c3e50 100%)" }}
            >
              <CardHeader>
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="h-6 w-6 text-black" />
                </div>
                <CardTitle className="text-white group-hover:text-gray-200 transition-colors duration-200">
                  Cosmetología
                </CardTitle>
                <CardDescription className="text-gray-200">
                  Tratamientos faciales personalizados para el cuidado y rejuvenecimiento de tu piel
                </CardDescription>
              </CardHeader>
            </Card>

            <Card
              className="hover:shadow-xl hover:-translate-y-2 transition-all duration-300 ease-out border border-gray-200 group"
              style={{ background: "linear-gradient(to right, #bdc3c7 0%, #2c3e50 100%)" }}
            >
              <CardHeader>
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Eye className="h-6 w-6 text-black" />
                </div>
                <CardTitle className="text-white group-hover:text-gray-200 transition-colors duration-200">
                  Cejas & Pestañas
                </CardTitle>
                <CardDescription className="text-gray-200">
                  Diseño, perfilado y tratamientos para realzar la belleza de tu mirada
                </CardDescription>
              </CardHeader>
            </Card>

            <Card
              className="hover:shadow-xl hover:-translate-y-2 transition-all duration-300 ease-out border border-gray-200 group"
              style={{ background: "linear-gradient(to right, #bdc3c7 0%, #2c3e50 100%)" }}
            >
              <CardHeader>
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Scissors className="h-6 w-6 text-black" />
                </div>
                <CardTitle className="text-white group-hover:text-gray-200 transition-colors duration-200">
                  Tricología Facial
                </CardTitle>
                <CardDescription className="text-gray-200">
                  Cuidado especializado del cabello facial y tratamientos capilares
                </CardDescription>
              </CardHeader>
            </Card>

            <Card
              className="hover:shadow-xl hover:-translate-y-2 transition-all duration-300 ease-out border border-gray-200 group"
              style={{ background: "linear-gradient(to right, #bdc3c7 0%, #2c3e50 100%)" }}
            >
              <CardHeader>
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="h-6 w-6 text-black" />
                </div>
                <CardTitle className="text-white group-hover:text-gray-200 transition-colors duration-200">
                  Depilación Láser
                </CardTitle>
                <CardDescription className="text-gray-200">
                  Tecnología avanzada para una depilación segura y duradera
                </CardDescription>
              </CardHeader>
            </Card>

            <Card
              className="hover:shadow-xl hover:-translate-y-2 transition-all duration-300 ease-out border border-gray-200 group"
              style={{ background: "linear-gradient(to right, #bdc3c7 0%, #2c3e50 100%)" }}
            >
              <CardHeader>
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Star className="h-6 w-6 text-black" />
                </div>
                <CardTitle className="text-white group-hover:text-gray-200 transition-colors duration-200">
                  Cuidados Personalizados
                </CardTitle>
                <CardDescription className="text-gray-200">
                  Planes de tratamiento únicos adaptados a tus necesidades específicas
                </CardDescription>
              </CardHeader>
            </Card>

            <Card
              className="hover:shadow-xl hover:-translate-y-2 transition-all duration-300 ease-out border border-gray-200 group"
              style={{ background: "linear-gradient(to right, #bdc3c7 0%, #2c3e50 100%)" }}
            >
              <CardHeader>
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Clock className="h-6 w-6 text-black" />
                </div>
                <CardTitle className="text-white group-hover:text-gray-200 transition-colors duration-200">
                  Consultas
                </CardTitle>
                <CardDescription className="text-gray-200">
                  Evaluación profesional y asesoramiento personalizado para tu rutina de belleza
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 px-4" id="contacto">
        <div className="container mx-auto max-w-4xl text-center">
          <h3 className="text-3xl font-bold text-black mb-4">Reserva tu Turno</h3>
          <p className="text-black text-lg mb-8">
            Agenda tu cita de forma rápida y sencilla. Nuestro equipo te contactará para confirmar.
          </p>

          <Card className="max-w-md mx-auto border border-gray-200 bg-white">
            <CardHeader>
              <CardTitle className="flex items-center justify-center text-black">
                <Calendar className="h-5 w-5 mr-2 text-black" />
                Sistema de Reservas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-gray-600">Sistema de reservas online integrado</div>
              <div className="space-y-2">
                <Button
                  onClick={openCalendar}
                  size="lg"
                  className="w-full bg-black hover:bg-gray-800 text-white"
                >
                <Calendar className="h-5 w-5 mr-2" />
                  Reservar Turno
                </Button>
                <Button
                  onClick={openMapModal}
                  variant="outline"
                  className="w-full bg-white border-black text-black hover:bg-black hover:text-white"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Ver Ubicación
                </Button>
                <Button
                  className="w-full bg-black hover:bg-gray-800 text-white"
                  onClick={() => window.open("https://wa.me/5492494245650", "_blank")}
                >
                  <WhatsAppIcon className="h-4 w-4 mr-2" />
                  WhatsApp
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <footer className="bg-gradient-to-r from-black to-gray-800 text-white py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="grid md:grid-cols-3 gap-8 text-center md:text-left">
            <div>
              <div className="flex items-center justify-center md:justify-start mb-4">
                <Image
                  src="/images/monnas-logo2.png"
                  alt="Monnas Logo"
                  width={24}
                  height={24}
                  className="rounded-full mr-2"
                />
                <h4 className="text-xl font-bold">Monnas</h4>
              </div>
              <p className="text-gray-300">Tu centro de belleza de confianza en Tandil</p>
            </div>

            <div>
              <h5 className="font-semibold mb-4">Servicios</h5>
              <ul className="space-y-2 text-gray-300">
                <li>Cosmetología</li>
                <li>Cejas & Pestañas</li>
                <li>Tricología Facial</li>
                <li>Depilación Láser</li>
              </ul>
            </div>

            <div>
              <h5 className="font-semibold mb-4">Contacto</h5>
              <div className="space-y-2 text-gray-300">
                <div className="flex items-center justify-center md:justify-start">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>Saavedra 841, Tandil</span>
                </div>
                <div className="flex items-center justify-center md:justify-start">
                  <Phone className="h-4 w-4 mr-2" />
                  <span>249 424-5650</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-600 mt-8 pt-8 text-center text-gray-400 text-sm">
  <p>
    &copy; 2025 Monnas - Centro de Cosmetología & Estética.{" "}
    <span className="font-medium text-gray-300">Designed by Kevin Martinez</span>
  </p>
</div>
        </div>
      </footer>
    </div>
  )
}
