# Canaán Conecta

Portal interno para el Centro Educativo Cristiano Canaán.

## Stack

- Next.js 15 con App Router
- React 19 + TypeScript strict
- Supabase Auth, Postgres y RLS
- Tailwind CSS + componentes estilo shadcn/ui
- Framer Motion para microinteracciones
- Zod + react-hook-form

## Variables de entorno

Crear un archivo `.env.local` con:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Cómo correr local

```bash
npm install
npm run dev
```

## Primer usuario administrador

1. Crear el usuario en Supabase Auth.
2. Insertar o dejar que el trigger cree la fila en `public.profiles`.
3. Asegurar que `rol = 'admin'` y `activo = true`.

Ejemplo de metadata para registro inicial:

```json
{
  "rol": "admin",
  "nombre_completo": "Dirección Canaán",
  "telefono": "+595..."
}
```

## Seguridad de fotos de menores

- Las fotos de alumnos deben vivir solo en buckets privados.
- No se deben exponer URLs públicas de imágenes de menores.
- La visibilidad para padres depende de consentimiento explícito y vínculo tutor-alumno.
- Toda entrega de imágenes debe ser por signed URLs de corta duración.

## Estado de la fase 1

- Login con Supabase Auth.
- Middleware con redirección por rol.
- Base inicial de `profiles` + trigger de alta automática.
- Páginas de rol preparadas como estructura mínima.
