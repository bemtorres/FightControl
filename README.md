# FightControl 🎮

FightControl is a professional realtime overlay system designed for competitive fighting game broadcasts. It provides a complete suite of tools to manage character selection, versus screens, and combat modules with ultra-low latency.

---

# FightControl 🎮 (Español)

FightControl es un sistema profesional de superposiciones (overlays) en tiempo real diseñado para transmisiones de juegos de lucha competitivos. Proporciona una suite completa de herramientas para gestionar la selección de personajes, pantallas de versus y módulos de combate con latencia ultra baja.

---

## 🚀 Key Features / Características Principales

### English
- **Realtime Control Panel**: Manage every aspect of the broadcast from a dedicated dashboard.
- **Ultra-Low Latency**: Sub-50ms synchronization between the control panel and the broadcast view.
- **Dynamic Overlays**: Professional character selection, presentation, and versus animations.
- **Cloud Sync**: Global synchronization using Supabase Realtime.
- **Mouse & Keyboard Support**: Intuitive controls for both players with customizable mappings.

### Español
- **Panel de Control en Tiempo Real**: Gestiona cada aspecto de la transmisión desde un panel dedicado.
- **Latencia Ultra Baja**: Sincronización de menos de 50ms entre el panel de control y la vista de transmisión.
- **Superposiciones Dinámicas**: Animaciones profesionales de selección, presentación y versus.
- **Sincronización en la Nube**: Sincronización global utilizando Supabase Realtime.
- **Soporte para Ratón y Teclado**: Controles intuitivos para ambos jugadores con mapeos personalizables.

---

## 🛠️ Technology Stack / Tecnologías Utilizadas

- **Frontend**: Next.js 15+, React 19, Tailwind CSS 4.
- **Animations**: Framer Motion.
- **Backend & Realtime**: Supabase (PostgreSQL + Realtime).
- **Icons**: Lucide React.
- **Deployment**: Optimized for Vercel/Self-hosting.

---

## 🛠️ Setup / Configuración

1. **Clone the repository / Clonar el repositorio**:
   ```bash
   git clone https://github.com/your-repo/fightcontrol.git
   ```

2. **Environment Variables / Variables de Entorno**:
   Create a `.env.local` file in the `web` directory with your Supabase credentials.
   Crea un archivo `.env.local` en el directorio `web` con tus credenciales de Supabase.
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   ```

3. **Install dependencies / Instalar dependencias**:
   ```bash
   cd web
   npm install
   ```

4. **Run development server / Ejecutar servidor de desarrollo**:
   ```bash
   npm run dev
   ```

---
oducción privada. Todos los derechos reservados.
