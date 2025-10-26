# Alumni by Better - Plataforma de Español 🚀

Una plataforma integral de gestión de aprendizaje de español diseñada específicamente para profesionales Alumni by Better, construida con la misma arquitectura robusta que Mindset LMS.

## 🎉 **PRODUCTION READY - LIVE NOW!** 
✅ **Complete Spanish LMS with all features working**

## 🎯 Características Principales

✅ **Sistema de Niveles CEFR Completado:**
- **A1**: Fundamentos del español (5 temas)
- **A2**: Comunicación básica (5 temas) 
- **B1**: Conversación fluida (5 temas)
- **B2**: Dominio avanzado (5 temas)

✅ **Contenido Español Estructurado:**
- Recursos gramaticales progresivos
- Vocabulario temático por nivel
- Objetivos de aprendizaje específicos
- Integración con Google Classroom

✅ **Funcionalidades Clave:**
- Autenticación basada en roles (Estudiante, Profesor, Admin)
- Sistema de reservas de clases con política de cancelación
- Seguimiento de progreso del estudiante
- Ejercicios interactivos (Lectura, Escritura, Escucha, Habla, Gramática)
- Dashboard para profesores con gestión de disponibilidad
- Panel administrativo completo
- Diseño responsivo optimizado para móviles

## 🏗️ Arquitectura Técnica

### **Stack Tecnológico:**
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes con Prisma ORM
- **Base de Datos**: SQLite (desarrollo) / PostgreSQL (producción)
- **Autenticación**: NextAuth.js con OAuth de Google
- **Componentes UI**: Radix UI, Lucide Icons
- **Español**: Reconocimiento de voz para práctica de pronunciación

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Google OAuth credentials (optional)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd alumni-lms
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```
Edit `.env` with your database URL and other configuration.

4. Set up the database:
```bash
npm run db:setup
```

5. Seed the database (optional):
```bash
npm run db:seed
```

6. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Database Schema

The application uses a comprehensive database schema including:

- **Users**: Students, teachers, admins, and alumni
- **Alumni**: Extended profile information for alumni
- **Topics/Courses**: Learning content and structure
- **Progress**: Learning progress tracking
- **Bookings**: Class scheduling and attendance
- **Exercises**: Interactive learning activities
- **Content**: Learning materials and resources

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:seed` - Seed database with sample data
- `npm run db:setup` - Setup database (push + generate)

## Project Structure

```
src/
├── app/                    # App Router pages and layouts
│   ├── (dashboard)/       # Dashboard group
│   ├── admin/             # Admin pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Main dashboard
│   ├── student/           # Student-specific pages
│   └── teacher/           # Teacher-specific pages
├── components/            # Reusable components
│   ├── exercises/         # Exercise-related components
│   ├── layout/            # Layout components
│   ├── learning/          # Learning-related components
│   └── ui/                # Basic UI components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries
├── types/                 # TypeScript type definitions
└── utils/                 # Utility functions
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.