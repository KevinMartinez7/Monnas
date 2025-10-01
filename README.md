# 🌸 Monnas - Centro de Estética y Belleza

![Monnas Logo](./public/images/monnas-logo2.png)

Una landing page moderna y elegante para Monnas, centro especializado en cosmetología, cejas, pestañas, tricología facial, depilación láser y masajes en Tandil, Buenos Aires.

## 🚀 Características Principales

### ✨ **Sistema de Reservas Online**
- **Calendario interactivo** con fechas disponibles y ocupadas
- **Selección de horarios** (cada hora de 9:00 a 20:00)
- **Múltiples servicios** seleccionables
- **Formulario completo** con datos del cliente
- **Integración con WhatsApp** para confirmación
- **Notificación de pago** (50% adelanto por transferencia)

### 🎨 **Diseño Responsivo**
- **Mobile-first** con adaptación completa a dispositivos móviles
- **Animaciones suaves** y transiciones elegantes
- **Gradientes modernos** y paleta de colores profesional
- **Componentes UI** con Shadcn/UI y Tailwind CSS

### 🗂️ **Secciones de la Landing**
- **Hero Section** con llamada a la acción principal
- **Galería de imágenes** con carrusel automático
- **Historia de Monnas** con diseño atractivo
- **Servicios ofrecidos** con íconos representativos
- **Sistema de contacto** integrado
- **Ubicación** con mapa embebido de Google Maps

### 💾 **Base de Datos**
- **Supabase** como backend
- **Gestión de reservas** con estados (pending/confirmed)
- **Prevención de dobles reservas** en mismo horario

## 🛠️ Tecnologías Utilizadas

### **Frontend**
- **Next.js 14** - Framework de React con App Router
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Framework de CSS utilitario
- **Shadcn/UI** - Componentes UI modernos
- **Lucide React** - Íconos vectoriales

### **Backend & Base de Datos**
- **Supabase** - Backend as a Service
- **PostgreSQL** - Base de datos relacional

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
├── app/                    # App Router de Next.js
│   ├── globals.css        # Estilos globales
│   ├── layout.tsx         # Layout principal
│   └── page.tsx          # Página principal
├── components/            # Componentes reutilizables
│   ├── ui/               # Componentes UI (Shadcn)
│   └── theme-provider.tsx
├── hooks/                # Custom hooks
├── lib/                  # Utilidades y configuraciones
│   ├── utils.ts          # Funciones utilitarias
│   └── supabase/         # Configuración de Supabase
├── public/               # Archivos estáticos
│   └── images/           # Imágenes del proyecto
├── scripts/              # Scripts de base de datos
└── styles/              # Estilos adicionales
```

## 🎯 Funcionalidades Detalladas

### **Sistema de Reservas**
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

3. **Integración WhatsApp**
   - Mensaje preformateado con todos los datos
   - Envío directo al número de la estética
   - Confirmación visual del proceso

### **Gestión de Estados**
- **Pending**: Reserva creada pero no confirmada
- **Confirmed**: Reserva confirmada por WhatsApp
- **Sistema de validación**: Previene reservas duplicadas

## 🚀 Despliegue

### **Vercel (Recomendado)**
1. Conecta tu repositorio con Vercel
2. Configura las variables de entorno
3. Despliega automáticamente

### **Otros Proveedores**
```bash
# Construir para producción
pnpm build

# Iniciar servidor de producción
pnpm start
```

## 🔧 Configuración Avanzada

### **Personalizar Horarios**
En `app/page.tsx`, modifica el array `availableTimes`:

```typescript
const availableTimes = [
  "09:00", "10:00", "11:00","12:00","13:00"
  "14:00", "15:00", "16:00", 
  "17:00", "18:00", "19:00", "20:00"
]
```

### **Modificar Servicios**
En `app/page.tsx`, actualiza el array `availableServices`:

```typescript
const availableServices = [
  { id: "servicio-id", name: "Nombre del Servicio", icon: IconComponent },
  // Agregar más servicios...
]
```

### **Cambiar Información de Contacto**
Actualiza el número de WhatsApp en:
- Función `handleConfirmReservation`
- Botones de contacto
- Variable: `whatsappUrl`

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
pnpm dev

# Construcción
pnpm build

# Producción
pnpm start

# Linting
pnpm lint

# Verificar tipos
pnpm type-check
```

## 🔒 Seguridad

- **Validación** de datos en frontend y backend
- **Sanitización** de inputs del usuario
- **Rate limiting** para prevenir spam
- **Variables de entorno** para datos sensibles

## 📊 Analytics y Monitoreo

Para agregar analytics, puedes integrar:
- **Google Analytics**
- **Vercel Analytics**
- **PostHog**

## 🐛 Solución de Problemas

### **Error de conexión a Supabase**
```bash
# Verificar variables de entorno
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### **Problemas de build**
```bash
# Limpiar cache
pnpm clean
pnpm install
pnpm build
```

## 📞 Contacto y Soporte

- **Desarrollador**: Kevin Martinez
- **Email**: [tu-email@ejemplo.com]
- **Cliente**: Monnas Estética
- **Ubicación**: Saavedra 841, Tandil, Buenos Aires

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

## 🌟 Agradecimientos

- **Monnas Estética** por confiar en este proyecto
- **Shadcn/UI** por los componentes elegantes
- **Supabase** por el backend confiable
- **Vercel** por el hosting de calidad

---

**Desarrollado con ❤️ por Kevin Martinez**

*¿Te gusta este proyecto? ¡Dale una ⭐ en GitHub!*