# 🌸 Monnas - Sistema Completo de Gestión para Centro de Estética

![Monnas Logo](./public/images/monnas-logo2.png)

Un sistema completo de gestión y reservas online para Monnas, centro especializado en cosmetología, cejas, pestañas, tricología facial, depilación láser y masajes en Tandil, Buenos Aires. Incluye landing page moderna y panel de administración completo.

## 🚀 Características Principales

### ✨ **Sistema de Reservas Online para Clientes**
- **Calendario interactivo** con fechas disponibles y ocupadas
- **Selección de horarios** (cada hora de 9:00 a 20:00)
- **Múltiples servicios** seleccionables
- **Formulario completo** con datos del cliente
- **Integración con WhatsApp** para confirmación
- **Notificación de pago** (50% adelanto por transferencia)
- **Prevención de dobles reservas** en tiempo real

### 👩‍💼 **Panel de Administración Completo**
- **Dashboard analítico** con métricas de reservas y gráficos
- **Gestión completa de reservas** (crear, editar, eliminar, confirmar)
- **Vista de calendario mensual** con todas las citas
- **Sistema de notificaciones** en tiempo real
- **Gestión de clientes** con historial de reservas
- **Autenticación segura** para acceso al admin
- **Exportación de datos** y reportes

### 📊 **Analytics y Reportes**
- **Gráficos de reservas** por día, semana y mes
- **Estadísticas de servicios** más solicitados
- **Métricas de crecimiento** y tendencias
- **Dashboard interactivo** con Chart.js
- **Indicadores de rendimiento** del negocio

### 🔔 **Sistema de Notificaciones**
- **Notificaciones en tiempo real** para nuevas reservas
- **Alertas de conflictos** de horarios
- **Centro de notificaciones** en el admin
- **Historial completo** de eventos

### 🎨 **Diseño Responsivo**
- **Mobile-first** con adaptación completa a dispositivos móviles
- **Animaciones suaves** y transiciones elegantes
- **Gradientes modernos** y paleta de colores profesional
- **Componentes UI** con Shadcn/UI y Tailwind CSS
- **Tema oscuro/claro** en el panel de administración

### 🗂️ **Secciones de la Landing**
- **Hero Section** con llamada a la acción principal
- **Galería de imágenes** con carrusel automático
- **Historia de Monnas** con diseño atractivo
- **Servicios ofrecidos** con íconos representativos
- **Sistema de contacto** integrado
- **Ubicación** con mapa embebido de Google Maps

### 💾 **Base de Datos Avanzada**
- **Supabase** como backend
- **Gestión de reservas** con estados (pending/confirmed)
- **Sistema de usuarios** y autenticación
- **Prevención de dobles reservas** en mismo horario
- **Índices optimizados** para mejor rendimiento
- **Backup automático** y seguridad de datos
- **Sincronización en tiempo real** entre admin y cliente

## 🛠️ Tecnologías Utilizadas

### **Frontend**
- **Next.js 15** - Framework de React con App Router
- **TypeScript** - Tipado estático para mayor confiabilidad
- **Tailwind CSS** - Framework de CSS utilitario
- **Shadcn/UI** - Componentes UI modernos y accesibles
- **Lucide React** - Íconos vectoriales
- **Chart.js & React-Chart.js-2** - Gráficos y analytics
- **React Hook Form** - Manejo de formularios
- **Zod** - Validación de esquemas

### **Backend & Base de Datos**
- **Supabase** - Backend as a Service completo
- **PostgreSQL** - Base de datos relacional robusta
- **Row Level Security** - Seguridad a nivel de fila
- **Real-time subscriptions** - Actualizaciones en tiempo real
- **Authentication** - Sistema de autenticación integrado

### **Analytics & Monitoreo**
- **Vercel Analytics** - Métricas de rendimiento
- **Chart.js** - Visualización de datos
- **Dashboard interactivo** - Métricas de negocio
- **Reportes automáticos** - Estadísticas de uso

### **Herramientas de Desarrollo**
- **pnpm** - Gestor de paquetes rápido
- **ESLint** - Linter para JavaScript/TypeScript
- **PostCSS** - Procesador de CSS

## 📋 Prerequisitos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** (versión 18 o superior)
- **pnpm** (recomendado) o npm/yarn
- **Git**

## 🚀 Instalación y Configuración

### 1. **Clonar el repositorio**
```bash
git clone https://github.com/KevinMartinez7/monnas-landing.git
cd monnas-landing
```

### 2. **Instalar dependencias**
```bash
pnpm install
# o
npm install
```

### 3. **Configurar variables de entorno**
Crea un archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

### 4. **Configurar la base de datos**
Ejecuta el script SQL en tu proyecto de Supabase:

```sql
-- Crear tabla de reservas
CREATE TABLE reservations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_phone TEXT NOT NULL,
  selected_date DATE NOT NULL,
  selected_time TEXT NOT NULL,
  selected_services TEXT[] NOT NULL,
  comments TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejor rendimiento
CREATE INDEX idx_reservations_date_time ON reservations(selected_date, selected_time);
CREATE INDEX idx_reservations_status ON reservations(status);
```

### 5. **Ejecutar en desarrollo**
```bash
pnpm dev
# o
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📁 Estructura del Proyecto

```
monnas-landing/
├── app/                           # App Router de Next.js
│   ├── globals.css               # Estilos globales
│   ├── layout.tsx                # Layout principal
│   ├── page.tsx                  # Página principal (landing + reservas)
│   └── admin/                    # Panel de Administración
│       ├── layout.tsx            # Layout del admin
│       ├── page.tsx              # Dashboard principal
│       ├── login/                # Autenticación
│       │   └── page.tsx
│       ├── reservations/         # Gestión de reservas
│       │   └── page.tsx
│       ├── calendar/             # Vista de calendario
│       │   └── page.tsx
│       ├── clients/              # Gestión de clientes
│       │   └── page.tsx
│       ├── notifications/        # Centro de notificaciones
│       │   └── page.tsx
│       └── components/           # Componentes del admin
│           ├── AdvancedDashboard.tsx
│           ├── ChartsDashboard.tsx
│           ├── CalendarView.tsx
│           ├── ClientManagement.tsx
│           ├── AddReservationModal.tsx
│           ├── EditReservationModal.tsx
│           ├── NotificationCenter.tsx
│           └── NotificationWidget.tsx
├── components/                   # Componentes reutilizables
│   ├── ui/                      # Componentes UI (Shadcn)
│   └── theme-provider.tsx       # Proveedor de temas
├── hooks/                       # Custom hooks
├── lib/                         # Utilidades y configuraciones
│   ├── utils.ts                 # Funciones utilitarias
│   └── supabase/                # Configuración de Supabase
│       └── client.ts
├── public/                      # Archivos estáticos
│   └── images/                  # Imágenes del proyecto
├── scripts/                     # Scripts de base de datos
│   └── 001_create_reservations_table.sql
└── styles/                      # Estilos adicionales
```

## 🎯 Funcionalidades Detalladas

### **Sistema de Reservas para Clientes**
1. **Selección de Servicios**: Múltiples opciones disponibles
   - Cosmetología
   - Cejas & Pestañas  
   - Tricología Facial
   - Depilación Láser
   - Cuidados Personalizados
   - Masajes

2. **Calendario Inteligente**
   - Muestra fechas ocupadas en tiempo real
   - Previene reservas en horarios no disponibles
   - Navegación por meses
   - Sincronización con reservas del admin
   - Colores diferenciados por disponibilidad

3. **Integración WhatsApp**
   - Mensaje preformateado con todos los datos
   - Envío directo al número de la estética
   - Confirmación visual del proceso

### **Panel de Administración**
1. **Dashboard Analítico**
   - Gráficos de reservas por período
   - Estadísticas de servicios más populares
   - Métricas de crecimiento del negocio
   - Indicadores de rendimiento (KPIs)
   - Vista de reservas recientes

2. **Gestión de Reservas**
   - Crear reservas manualmente
   - Editar reservas existentes
   - Cambiar estado (pending/confirmed)
   - Eliminar reservas
   - Búsqueda y filtros avanzados
   - Vista de lista y calendario

3. **Vista de Calendario**
   - Calendario mensual interactivo
   - Ver todas las citas del mes
   - Navegación entre meses
   - Indicadores visuales de ocupación
   - Estadísticas por día

4. **Gestión de Clientes**
   - Lista completa de clientes
   - Historial de reservas por cliente
   - Información de contacto
   - Búsqueda de clientes
   - Estadísticas de visitas

5. **Sistema de Notificaciones**
   - Notificaciones en tiempo real
   - Centro de notificaciones
   - Alertas de nuevas reservas
   - Historial de eventos
   - Configuración de alertas

### **Gestión de Estados**
- **Pending**: Reserva creada desde la web, pendiente de confirmación
- **Confirmed**: Reserva confirmada por WhatsApp o creada desde admin
- **Sistema de validación**: Previene reservas duplicadas
- **Sincronización completa**: Entre vista cliente y admin

## 🚀 Despliegue

### **Vercel (Recomendado)**
1. Conecta tu repositorio con Vercel
2. Configura las variables de entorno:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
   ```
3. Despliega automáticamente

### **Otros Proveedores**
```bash
# Construir para producción
pnpm build

# Iniciar servidor de producción
pnpm start
```

## 🎛️ Acceso al Panel de Administración

Una vez desplegado, accede al panel de administración en:
```
https://tu-dominio.com/admin/login
```

**Credenciales por defecto** (cambiar después del primer acceso):
- Usuario: `admin@monnas.com`
- Contraseña: `admin123`

### **Funcionalidades del Admin:**
- 📊 **Dashboard**: `/admin` - Vista general con analytics
- 📅 **Reservas**: `/admin/reservations` - Gestión completa de citas
- 🗓️ **Calendario**: `/admin/calendar` - Vista mensual de reservas
- 👥 **Clientes**: `/admin/clients` - Gestión de base de clientes
- 🔔 **Notificaciones**: `/admin/notifications` - Centro de alertas

## 🔧 Configuración Avanzada

### **Personalizar Horarios**
En `app/page.tsx`, modifica el array `availableTimes`:

```typescript
const availableTimes = [
  "09:00", "10:00", "11:00", "12:00", "13:00",
  "14:00", "15:00", "16:00", 
  "17:00", "18:00", "19:00", "20:00"
]
```

### **Modificar Servicios**
En `app/page.tsx` y `app/admin/components/AddReservationModal.tsx`:

```typescript
const availableServices = [
  { id: "servicio-id", name: "Nombre del Servicio", icon: IconComponent },
  // Agregar más servicios...
]
```

### **Configurar Autenticación del Admin**
En Supabase, configura las políticas de seguridad y usuarios admin.

### **Personalizar Dashboard Analytics**
En `app/admin/components/ChartsDashboard.tsx`, ajusta:
- Tipos de gráficos
- Períodos de análisis
- Métricas mostradas
- Colores y estilos

### **Cambiar Información de Contacto**
Actualiza el número de WhatsApp en:
- Función `handleConfirmReservation` en `app/page.tsx`
- Botones de contacto
- Variable: `whatsappUrl`

### **Configurar Notificaciones**
En `app/admin/components/NotificationCenter.tsx`:
- Tipos de notificaciones
- Frecuencia de actualización
- Sonidos y alertas visuales

## 📱 Responsive Design

El proyecto está optimizado para:
- **📱 Mobile**: 320px - 768px
- **💻 Tablet**: 768px - 1024px  
- **🖥️ Desktop**: 1024px+

## 🎨 Personalización de Estilos

### **Colores Principales**
```css
/* Paleta de colores */
--primary: Pink (rosa)
--secondary: Gray (gris)
--accent: Black (negro)
--gradient: Linear gradient (gris a negro)
```

### **Componentes Shadcn/UI**
Los componentes están en `components/ui/` y pueden personalizarse modificando:
- `tailwind.config.js`
- `components.json`

## 🤝 Contribución

1. **Fork** el proyecto
2. **Crea** una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. **Push** a la rama (`git push origin feature/AmazingFeature`)
5. **Abre** un Pull Request

## 📝 Scripts Disponibles

```bash
# Desarrollo
pnpm dev              # Inicia servidor de desarrollo
npm run dev           # Alternativa con npm

# Construcción
pnpm build            # Construye para producción
npm run build         # Alternativa con npm

# Producción
pnpm start            # Inicia servidor de producción
npm run start         # Alternativa con npm

# Linting
pnpm lint             # Ejecuta ESLint
npm run lint          # Alternativa con npm

# Verificar tipos
pnpm type-check       # Verifica tipos TypeScript (si configurado)

# Instalación
pnpm install          # Instala dependencias
npm install           # Alternativa con npm
```

## 🚦 Estado del Proyecto

### ✅ **Completado**
- ✅ Landing page responsiva
- ✅ Sistema de reservas para clientes
- ✅ Panel de administración completo
- ✅ Dashboard con analytics
- ✅ Gestión de reservas (CRUD)
- ✅ Vista de calendario
- ✅ Sistema de notificaciones
- ✅ Gestión de clientes
- ✅ Autenticación segura
- ✅ Integración WhatsApp
- ✅ Sincronización tiempo real
- ✅ Manejo correcto de fechas y timezones
- ✅ Responsive design completo
- ✅ Deploy en Vercel

### 🔄 **En Desarrollo**
- 🔄 Mejoras en UX/UI
- 🔄 Optimizaciones de rendimiento
- 🔄 Funciones adicionales de reportes

### 📋 **Funcionalidades Futuras**
- 📧 Envío de emails automáticos
- 💳 Integración de pagos online
- 📱 App móvil nativa
- 🔗 API pública para integraciones
- 📊 Reportes avanzados exportables

## 🔒 Seguridad

- **Autenticación robusta** con Supabase Auth
- **Row Level Security** en base de datos
- **Validación** de datos en frontend y backend
- **Sanitización** de inputs del usuario
- **Rate limiting** para prevenir spam
- **Variables de entorno** para datos sensibles
- **Políticas de acceso** diferenciadas por rol
- **Encriptación** de datos sensibles
- **Auditoría** de acciones del admin

## 📊 Analytics y Monitoreo

### **Dashboard Integrado**
- **Gráficos en tiempo real** de reservas
- **Métricas de crecimiento** mensual y anual
- **Servicios más populares** con estadísticas
- **Horarios de mayor demanda** para optimización
- **Análisis de tendencias** estacionales

### **Reportes Disponibles**
- **Reservas por período** (día, semana, mes)
- **Análisis de servicios** más solicitados
- **Estadísticas de clientes** recurrentes
- **Horarios pico** de mayor actividad
- **Métricas de conversión** web-a-reserva

### **Integraciones Externas**
Para análisis adicional, puedes integrar:
- **Google Analytics 4** - Comportamiento web
- **Vercel Analytics** - Rendimiento del sitio
- **PostHog** - Analytics de producto
- **Mixpanel** - Análisis de eventos

## 🐛 Solución de Problemas

### **Error de conexión a Supabase**
```bash
# Verificar variables de entorno
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### **Problemas de build**
```bash
# Limpiar cache y reinstalar
pnpm clean
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm build
```

### **Reservas del admin no aparecen en la página principal**
Verificar que la consulta incluya ambos estados:
```typescript
.in("status", ["pending", "confirmed"])
```

### **Problemas con gráficos (Chart.js)**
Asegurar que las dependencias estén instaladas:
```bash
pnpm add chart.js react-chartjs-2
```

### **Errores de autenticación en admin**
1. Verificar configuración de Supabase Auth
2. Revisar políticas de Row Level Security
3. Confirmar variables de entorno

### **Fechas incorrectas en reservas**
El sistema usa funciones de manejo de fechas seguras:
- `formatDateLocal()` para guardar fechas
- `formatDateDisplay()` para mostrar fechas
- `createDateFromString()` para crear objetos Date

## 📞 Contacto y Soporte

- **Desarrollador**: Kevin Martinez
- **Email**: [tu-email@ejemplo.com]
- **Cliente**: Monnas Estética  
- **Ubicación**: Saavedra 841, Tandil, Buenos Aires
- **Repositorio**: [GitHub - KevinMartinez7/Monnas](https://github.com/KevinMartinez7/Monnas)
- **Demo Live**: [https://monnas-spa.vercel.app](https://monnas-spa.vercel.app)
- **Admin Panel**: [https://monnas-spa.vercel.app/admin](https://monnas-spa.vercel.app/admin)

### 🆘 **Soporte Técnico**
Si encuentras problemas o necesitas ayuda:
1. Revisa la sección de [Solución de Problemas](#-solución-de-problemas)
2. Crea un issue en GitHub con detalles del problema
3. Incluye logs de consola y pasos para reproducir
4. Especifica versión de Node.js y sistema operativo

### 📈 **Actualizaciones**
- **v1.0.0** - Sistema básico de reservas
- **v2.0.0** - Panel de administración completo
- **v2.1.0** - Analytics y dashboard
- **v2.2.0** - Sistema de notificaciones
- **v2.3.0** - Gestión de clientes
- **v2.4.0** - Mejoras en manejo de fechas y sincronización

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

## 🌟 Agradecimientos

- **Monnas Estética** por confiar en este proyecto completo
- **Shadcn/UI** por los componentes elegantes y accesibles
- **Supabase** por el backend robusto y confiable
- **Vercel** por el hosting de calidad y deployments automáticos
- **Chart.js** por las visualizaciones de datos interactivas
- **Next.js Team** por el framework excepcional
- **Tailwind CSS** por el sistema de diseño eficiente

---

**Desarrollado con ❤️ por Kevin Martinez**

*Un sistema completo de gestión para centros de estética modernos*

*¿Te gusta este proyecto? ¡Dale una ⭐ en GitHub y compártelo!*

---

### 🎯 **¿Por qué elegir este sistema?**

✅ **Completo**: Landing + Admin + Analytics en una sola solución  
✅ **Moderno**: Tecnologías actuales y mejores prácticas  
✅ **Escalable**: Diseñado para crecer con tu negocio  
✅ **Seguro**: Autenticación robusta y protección de datos  
✅ **Responsive**: Funciona perfecto en todos los dispositivos  
✅ **Mantenible**: Código limpio y bien documentado

**¡Tu centro de estética merece la mejor tecnología!** 💫