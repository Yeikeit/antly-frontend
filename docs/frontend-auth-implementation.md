# Implementación de autenticación — Frontend (Next.js 16)

## Índice

1. [Stack y versiones](#1-stack-y-versiones)
2. [Arquitectura general](#2-arquitectura-general)
3. [Cambios importantes en Next.js 16](#3-cambios-importantes-en-nextjs-16)
4. [Mapa de archivos](#4-mapa-de-archivos)
5. [Almacenamiento de tokens](#5-almacenamiento-de-tokens)
6. [Capa API (`lib/api/`)](#6-capa-api-libapi)
7. [Validación de formularios (`lib/validations/`)](#7-validación-de-formularios-libvalidations)
8. [AuthProvider y contexto (`store/auth-context.tsx`)](#8-authprovider-y-contexto-storeaauth-contexttsx)
9. [Protección de rutas (`proxy.ts`)](#9-protección-de-rutas-proxyts)
10. [Páginas de autenticación](#10-páginas-de-autenticación)
11. [Dashboard](#11-dashboard)
12. [Variables de entorno](#12-variables-de-entorno)
13. [Flujos completos](#13-flujos-completos)
14. [CORS en el backend](#14-cors-en-el-backend)
15. [Cómo correr el proyecto](#15-cómo-correr-el-proyecto)

---

## 1. Stack y versiones

| Tecnología | Versión | Rol |
|---|---|---|
| Next.js | 16.2.3 | Framework fullstack (App Router) |
| React | 19.2.4 | UI |
| TypeScript | 5.x | Tipado estático |
| Tailwind CSS | 4.x | Estilos |
| Zod | 4.3.6 | Validación de formularios |

No se usa ninguna librería de autenticación externa (NextAuth, Clerk, etc.). La integración es directa con el backend NestJS.

---

## 2. Arquitectura general

```
Browser
  │
  ├─ proxy.ts          ← corre en cada request al servidor Next.js
  │    └─ lee cookie "access_token"
  │         ├─ no existe → redirect /login
  │         └─ existe   → deja pasar
  │
  ├─ AuthProvider      ← estado en memoria (React Context)
  │    ├─ user: AuthUser | null
  │    └─ isLoading: boolean
  │
  └─ lib/api/client.ts ← fetch wrapper
       ├─ lee "access_token" de document.cookie
       ├─ adjunta Authorization: Bearer {token}
       └─ si recibe 401 → intenta refresh automático
```

El token de acceso vive en dos lugares simultáneamente:
- **Cookie `access_token`** (no httpOnly): leída por `proxy.ts` para proteger rutas y por el fetch wrapper para las llamadas a la API.
- **`localStorage.auth_user`**: datos del usuario para reconstruir el contexto sin ir al servidor al recargar la página.
- **`localStorage.auth_refresh`**: refresh token para renovar el access token automáticamente.

---

## 3. Cambios importantes en Next.js 16

### `middleware.ts` → `proxy.ts`

En Next.js 16 el archivo `middleware.ts` fue renombrado a `proxy.ts` y la función exportada debe llamarse `proxy` (no `middleware`). Es un breaking change respecto a versiones anteriores.

```ts
// ✅ Next.js 16
export function proxy(request: NextRequest) { ... }

// ❌ Next.js 15 y anteriores (ya no funciona)
export function middleware(request: NextRequest) { ... }
```

### Runtime

En Next.js 16 el proxy corre en el **Node.js runtime** por defecto (en versiones anteriores era Edge Runtime). Esto lo hace más compatible con librerías de Node.js.

### `cookies()` es async

En Next.js 15+ la función `cookies()` de `next/headers` es asíncrona:
```ts
const cookieStore = await cookies(); // ✅
cookieStore.get('session');
```
En el `proxy.ts` no se usa `cookies()` sino `request.cookies` (síncrono, API de `NextRequest`).

### Zod v4

Se instaló Zod v4 (4.3.6). La API cambió respecto a v3:

```ts
// v4
z.email({ error: 'Email inválido' })
z.string().min(8, { error: 'Mínimo 8 caracteres' })

// v3 (diferente)
z.string().email('Email inválido')
z.string().min(8, 'Mínimo 8 caracteres')
```

---

## 4. Mapa de archivos

```
antly-frontend/
├── proxy.ts                        ← protección de rutas (Next.js 16)
├── .env.local                      ← NEXT_PUBLIC_API_URL
│
├── types/
│   └── auth.ts                     ← AuthUser, AuthResponse
│
├── lib/
│   ├── api/
│   │   ├── client.ts               ← fetch wrapper con token e auto-refresh
│   │   └── auth.ts                 ← login, register, logout, refresh
│   └── validations/
│       └── auth.ts                 ← schemas Zod para login y register
│
├── store/
│   └── auth-context.tsx            ← AuthProvider + useAuth hook
│
└── app/
    ├── layout.tsx                  ← root layout: envuelve con AuthProvider
    ├── page.tsx                    ← redirige a /login
    ├── (auth)/
    │   ├── layout.tsx              ← layout centrado para auth pages
    │   ├── login/
    │   │   └── page.tsx            ← formulario de login
    │   └── register/
    │       └── page.tsx            ← formulario de registro
    └── dashboard/
        └── page.tsx                ← dashboard placeholder protegido
```

---

## 5. Almacenamiento de tokens

### Por qué cookie no-httpOnly para el access token

El `proxy.ts` corre en el servidor de Next.js y solo puede leer **cookies** (no `localStorage`). Para que la protección de rutas funcione, el access token debe estar en una cookie.

La cookie se define como **no httpOnly** (accesible desde JavaScript) porque el fetch wrapper del lado del cliente también necesita leerla para adjuntarla en cada petición al backend NestJS.

| Lugar | Qué guarda | Quién lo lee |
|---|---|---|
| Cookie `access_token` | JWT de acceso (15 min) | `proxy.ts` + `lib/api/client.ts` |
| `localStorage.auth_refresh` | Refresh token (7 días) | `lib/api/client.ts` (auto-refresh) |
| `localStorage.auth_user` | Datos del usuario | `AuthProvider` (reconstruir estado al recargar) |

### Ciclo de vida de la cookie

```ts
// Al hacer login/register
document.cookie = `access_token=${token};path=/;max-age=900;SameSite=Lax`;
//                                                       ↑ 15 min en segundos

// Al hacer logout
document.cookie = 'access_token=;path=/;max-age=0';
```

`SameSite=Lax` previene CSRF en requests de terceros. No se marca como `Secure` en desarrollo local (HTTP), pero debería agregarse en producción (HTTPS).

---

## 6. Capa API (`lib/api/`)

### `lib/api/client.ts` — fetch wrapper central

```
apiRequest(path, options)
    │
    ├─ lee access_token de document.cookie
    ├─ agrega Authorization: Bearer {token}
    ├─ hace fetch al backend
    │
    ├─ si 401:
    │    ├─ lee auth_refresh de localStorage
    │    ├─ llama POST /auth/refresh
    │    ├─ actualiza cookie con nuevo access_token
    │    └─ reintenta el request original
    │
    ├─ si 204: retorna undefined
    ├─ si error: lanza ApiError con el mensaje del backend
    └─ si ok: retorna JSON parseado
```

**`ApiError`** es una clase custom que extiende `Error` y expone el `status` HTTP. Las páginas la usan para mostrar mensajes de error específicos:

```ts
try {
  await login(email, password);
} catch (err) {
  if (err instanceof ApiError) {
    setServerError(err.message); // "Credenciales inválidas"
  }
}
```

### `lib/api/auth.ts` — endpoints de autenticación

| Función | Método | Endpoint | Body |
|---|---|---|---|
| `login(email, password)` | POST | `/auth/login` | `{ email, password }` |
| `register(email, password, firstName, lastName)` | POST | `/auth/register` | `{ email, password, firstName, lastName }` |
| `logout(refreshToken)` | POST | `/auth/logout` | `{ refreshToken }` |
| `refreshAccessToken(refreshToken)` | POST | `/auth/refresh` | `{ refreshToken }` |

Todas retornan el tipo correcto inferido por TypeScript gracias al genérico `apiRequest<T>`.

---

## 7. Validación de formularios (`lib/validations/`)

Se usan schemas Zod v4 para validar los campos antes de enviarlos al backend.

```ts
// lib/validations/auth.ts

export const loginSchema = z.object({
  email: z.email({ error: 'Email inválido' }),
  password: z.string().min(1, { error: 'La contraseña es requerida' }),
});

export const registerSchema = z.object({
  email: z.email({ error: 'Email inválido' }),
  password: z.string().min(8, { error: 'Mínimo 8 caracteres' }),
  firstName: z.string().min(1, { error: 'El nombre es requerido' }),
  lastName: z.string().min(1, { error: 'El apellido es requerido' }),
});
```

Uso en las páginas con `safeParse`:

```ts
const result = loginSchema.safeParse({ email, password });
if (!result.success) {
  const fieldErrors = result.error.flatten().fieldErrors;
  setErrors({
    email: fieldErrors.email?.[0],
    password: fieldErrors.password?.[0],
  });
  return; // no llama al backend
}
```

La validación es client-side (feedback inmediato). El backend también valida con `class-validator`, por lo que hay doble validación.

---

## 8. AuthProvider y contexto (`store/auth-context.tsx`)

### Qué expone

```ts
interface AuthContextValue {
  user: AuthUser | null;  // datos del usuario autenticado
  isLoading: boolean;     // true mientras lee localStorage al montar
  login: (email, password) => Promise<void>;
  register: (email, password, firstName, lastName) => Promise<void>;
  logout: () => Promise<void>;
}
```

### Ciclo de vida

```
Montar AuthProvider
    │
    └─ useEffect: lee localStorage.auth_user
         ├─ existe → setUser(JSON.parse(stored))
         └─ no existe → user queda null
         └─ setIsLoading(false)

login(email, password)
    ├─ llama authApi.login()
    ├─ guarda user en state + localStorage
    ├─ guarda refreshToken en localStorage
    ├─ setea cookie access_token
    └─ router.push('/dashboard')

logout()
    ├─ llama authApi.logout(refreshToken) → revoca en el backend
    ├─ limpia state, localStorage y cookie
    └─ router.push('/login')
```

### Uso en componentes

```tsx
// En cualquier Client Component dentro de AuthProvider
const { user, logout } = useAuth();
```

`useAuth()` lanza un error si se usa fuera de `AuthProvider`, lo que ayuda a detectar errores de estructura en desarrollo.

### Por qué no httpOnly para la cookie

Si la cookie fuera httpOnly, el JavaScript del browser no podría leerla y `lib/api/client.ts` no podría adjuntar el Bearer token. Tendríamos que enrutar todas las llamadas al backend a través de Route Handlers de Next.js (que sí pueden leer cookies httpOnly), lo que agrega complejidad innecesaria para un MVP.

---

## 9. Protección de rutas (`proxy.ts`)

```ts
const PUBLIC_ROUTES = ['/login', '/register'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasToken = request.cookies.has('access_token');

  // Raíz: redirige según auth
  if (pathname === '/') {
    return NextResponse.redirect(new URL(hasToken ? '/dashboard' : '/login', request.url));
  }

  const isPublic = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));

  // Usuario autenticado visitando login/register → va al dashboard
  if (isPublic && hasToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Usuario sin token visitando ruta protegida → va al login
  if (!isPublic && !hasToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}
```

### Matriz de decisiones del proxy

| Ruta | ¿Tiene token? | Resultado |
|---|---|---|
| `/` | No | Redirect → `/login` |
| `/` | Sí | Redirect → `/dashboard` |
| `/login` | No | Pasa |
| `/login` | Sí | Redirect → `/dashboard` |
| `/register` | No | Pasa |
| `/register` | Sí | Redirect → `/dashboard` |
| `/dashboard` | No | Redirect → `/login` |
| `/dashboard` | Sí | Pasa |

### Matcher

```ts
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

Excluye archivos estáticos para que el proxy no corra innecesariamente en cada asset. Corre en todas las rutas del router de Next.js.

### Importante

El proxy solo hace una **verificación optimista** (¿existe la cookie?). No valida la firma del JWT ni consulta la base de datos. Si alguien pone una cookie falsa, llegará a las páginas pero los requests al backend fallarán con 401 porque el JWT real es inválido.

---

## 10. Páginas de autenticación

### Layout compartido `app/(auth)/layout.tsx`

El grupo `(auth)` no agrega segmento a la URL. `/login` y `/register` comparten un layout centrado:

```
┌─────────────────────────────────┐
│                                 │
│         ┌───────────┐           │
│         │  Tarjeta  │           │
│         │  blanca   │           │
│         └───────────┘           │
│                                 │
└─────────────────────────────────┘
bg-zinc-50
```

### `/login` — `app/(auth)/login/page.tsx`

- Client Component (`'use client'`)
- Estado local: `email`, `password`, `errors` (por campo), `serverError`, `loading`
- Valida con `loginSchema.safeParse()` antes de llamar al backend
- Muestra error por campo (bajo el input) y error del servidor (sobre el botón)
- Deshabilita el botón mientras `loading === true`
- Link a `/register`

### `/register` — `app/(auth)/register/page.tsx`

- Mismo patrón que login, con 4 campos: `firstName`, `lastName`, `email`, `password`
- `firstName` y `lastName` van en un grid de 2 columnas
- Valida con `registerSchema.safeParse()`
- Link a `/login`

---

## 11. Dashboard

`app/dashboard/page.tsx` es un Client Component que usa `useAuth()` para:
- Mostrar el nombre del usuario en el header
- Proveer el botón "Cerrar sesión" que llama a `logout()`

Es un placeholder. Las funcionalidades reales (presupuestos, categorías, transacciones) se agregarán en los siguientes sprints.

---

## 12. Variables de entorno

### `.env.local` (frontend)

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

El prefijo `NEXT_PUBLIC_` expone la variable al bundle del browser. Sin ese prefijo, solo estaría disponible en el servidor de Next.js.

### `.env` (backend) — referencia

```env
FRONTEND_URL=http://localhost:3000   # usado en CORS
JWT_ACCESS_SECRET=...
JWT_REFRESH_EXPIRES_DAYS=7
DATABASE_URL=...
```

---

## 13. Flujos completos

### Registro

```
1. Usuario llena el formulario → RegisterPage
2. safeParse() valida campos → errores por campo si falla
3. authApi.register() → POST /auth/register (NestJS)
4. NestJS:
   - Verifica que el email no exista
   - Hashea la contraseña con bcrypt
   - Guarda el usuario
   - Genera access token (JWT, 15 min) + refresh token (random, 7 días)
   - Guarda hash del refresh token en DB
5. Frontend recibe { accessToken, refreshToken, user }
6. storeSession():
   - setUser(user)
   - localStorage.auth_user = JSON.stringify(user)
   - localStorage.auth_refresh = refreshToken
   - document.cookie = "access_token=...;max-age=900"
7. router.push('/dashboard')
8. proxy.ts detecta la cookie → permite acceso a /dashboard
```

### Login

Igual que registro, pero paso 4 verifica credenciales en lugar de crear usuario.

### Renovación automática de token (auto-refresh)

```
1. Usuario hace una acción que llama a apiRequest()
2. El access token expiró (15 min)
3. Backend responde 401
4. tryRefresh():
   - Lee auth_refresh de localStorage
   - POST /auth/refresh con { refreshToken }
   - Backend busca el hash del refresh token en DB
   - Si es válido y no expiró → genera nuevo access token
   - Devuelve { accessToken }
5. setAccessTokenCookie(newToken) — actualiza la cookie
6. Reintenta el request original con el nuevo token
7. El usuario no nota nada
```

Si el refresh token también expiró (después de 7 días), el reintento también falla con 401, y el usuario debe volver a loguearse.

### Logout

```
1. Usuario hace click en "Cerrar sesión"
2. Lee auth_refresh de localStorage
3. POST /auth/logout con { refreshToken } (requiere Bearer token en header)
4. NestJS marca el refresh token como revocado (revokedAt = now)
5. Frontend limpia:
   - state: user = null
   - localStorage: elimina auth_user y auth_refresh
   - Cookie: max-age=0 (elimina access_token)
6. router.push('/login')
7. proxy.ts: no hay cookie → /login pasa, /dashboard redirigiría a /login
```

---

## 14. CORS en el backend

Para que el browser pueda hacer requests desde `http://localhost:3000` a `http://localhost:8080`, el backend habilita CORS en `main.ts`:

```ts
app.enableCors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
});
```

`credentials: true` es necesario para que el browser envíe cookies en requests cross-origin (aunque en este caso las cookies van en el header `Authorization`, no de forma automática).

---

## 15. Cómo correr el proyecto

### Backend

```bash
cd antly-backend
npm run start:dev
# corre en http://localhost:8080
```

### Frontend

```bash
cd antly-frontend
npm run dev
# corre en http://localhost:3000
```

### Flujo de prueba manual

1. Ir a `http://localhost:3000` → redirige a `/login`
2. Hacer click en "Registrate" → ir a `/register`
3. Completar el formulario → redirige a `/dashboard`
4. Recargar la página → sigue en `/dashboard` (token en cookie)
5. Cerrar sesión → redirige a `/login`
6. Intentar ir a `http://localhost:3000/dashboard` → redirige a `/login`
