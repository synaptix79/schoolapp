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

Los roles y el colegio se toman de `app_metadata`, que solamente debe escribir el
backend administrativo de Supabase. Nunca se deben aceptar desde el formulario
del usuario.

```json
{
  "app_metadata": {
    "rol": "admin",
    "school_id": "00000000-0000-4000-8000-000000000001"
  },
  "user_metadata": {
    "nombre_completo": "Dirección Canaán",
    "telefono": "+595..."
  }
}
```

## Rol Padre/Encargado

El rol persistido es `padre_encargado`. La migración
`0005_guardian_multistudent.sql`:

- agrega aislamiento por `school_id`;
- migra perfiles anteriores con rol `padre`;
- crea `guardian_students` con relación muchos-a-muchos;
- impide vínculos duplicados o entre colegios diferentes;
- incorpora las tablas de asistencia, calificaciones, materias, horarios,
  comunicados, pagos, documentos y notificaciones;
- aplica RLS por alumno asignado y funciones de autorización para las APIs.

Para habilitarlo:

1. Configurar las variables de Supabase en `.env.local`.
2. Vincular el proyecto con Supabase CLI y ejecutar `supabase db push`, o aplicar
   las migraciones en orden desde el editor SQL.
3. Crear la cuenta familiar con `app_metadata.rol = "padre_encargado"`.
4. Ingresar como Dirección y abrir `/admin/vinculaciones`.
5. Seleccionar el encargado, vincular uno o más alumnos y definir el tipo de
   relación y el encargado principal.
6. Iniciar sesión con la cuenta familiar. El selector superior cargará
   exclusivamente los alumnos activos autorizados.

Las rutas `/api/guardian/**` no usan datos demo. Si Supabase no está
configurado, responden `503` y la interfaz muestra un estado de configuración
pendiente sin exponer información académica.

## Pruebas

```bash
npm test
npm run lint
npx tsc --noEmit --incremental false
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
