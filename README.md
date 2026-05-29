# Antly — Frontend

Aplicación web de gestión de presupuestos personales. Permite a los usuarios organizar sus finanzas mensuales: registrar ingresos, definir presupuestos, categorizar gastos y visualizar métricas de seguimiento.

## Stack

- **Next.js 16** (App Router, output standalone)
- **React 19**
- **TypeScript 5**
- **Tailwind CSS 4**
- **Recharts** — gráficos de estadísticas
- **Zod** — validación de formularios

## Requisitos

- Node.js ≥ 20
- Backend Antly corriendo (ver `antly-backend/`)

## Variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Instalación y desarrollo

```bash
npm install
npm run start:dev
```

La app estará disponible en [http://localhost:3000](http://localhost:3000).

## Scripts

| Script | Descripción |
|--------|-------------|
| `npm run start:dev` | Servidor de desarrollo con hot-reload |
| `npm run build` | Compilación para producción |
| `npm run start` | Servidor de producción (requiere build previo) |
| `npm run start:prod` | Servidor standalone (output de build) |
| `npm run lint` | Análisis estático con ESLint |

## Estructura de carpetas

```
app/              # Rutas y páginas (Next.js App Router)
  (auth)/         # Login y registro (layout sin sidebar)
  (budget-wizard)/# Flujo de creación de presupuesto
  budget/         # Vista de presupuesto activo, historial y detalle
  dashboard/      # Resumen financiero del mes
  statistics/     # Gráficos y métricas históricas
  transactions/   # Listado y registro de transacciones
  settings/       # Configuración de usuario y fuentes de ingreso

components/       # Componentes reutilizables por dominio
  auth/           # Formularios de autenticación
  budget/         # Cards, gráficos y pantallas del presupuesto
  dashboard/      # Widgets del dashboard
  transaction/    # Modales y listados de transacciones
  ui/             # Componentes genéricos (Loader, Sidebar, etc.)

hooks/            # Custom hooks por dominio (budget, auth, transaction…)
lib/
  api/            # Funciones de llamada a la API REST
  auth/           # Helpers de autenticación y tokens
  utils/          # Utilidades (formatCLP, fechas, etc.)
  validations/    # Esquemas Zod
store/            # Contextos React (auth, flujo de presupuesto)
types/            # Tipos TypeScript globales por dominio
```

## Convenciones

- **Formato de moneda:** siempre con `formatCLP(amount)` de `lib/utils/currency.ts`. Sin decimales, locale `es-CL`.
- **Responsive:** mobile-first con Tailwind. Breakpoint principal: `md:` (≥ 768 px). No modificar clases `md:` existentes al hacer ajustes mobile.
- **Autenticación:** JWT con refresh token. El contexto global está en `store/auth-context.tsx`. Rutas protegidas mediante middleware Next.js.
- **API:** todas las llamadas pasan por `lib/api/`. No hacer `fetch` directo desde componentes o páginas.

## Docker

```bash
# Desde la raíz del monorepo
docker compose up --build
```

El frontend corre en el puerto `3000` dentro del contenedor.


## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

Cambio prueba front
