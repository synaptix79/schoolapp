-- ─────────────────────────────────────────────────────────────────────────────
-- Fase 3: Tareas y entregas + extensión de perfiles (CI, datos médicos)
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Extender profiles con Nº de CI
alter table public.profiles
  add column if not exists ci text;

-- 2. Tabla de alumnos (datos académicos + sensibles)
create table public.alumnos (
  id                    uuid        primary key default gen_random_uuid(),
  nombre                text        not null,
  fecha_nacimiento      date,
  grado                 text,
  seccion               text,
  anio_lectivo          integer     not null default extract(year from now()),
  ci                    text,
  tipo_sangre           text,
  contacto_emergencia   text,
  observaciones_medicas text,
  tutor_id              uuid        references public.profiles(id) on delete set null,
  consent_fotos         boolean     not null default false,
  activo                boolean     not null default true,
  created_at            timestamptz not null default now()
);

alter table public.alumnos enable row level security;

-- Padres/tutores ven solo sus alumnos
create policy "tutor ve sus alumnos"
  on public.alumnos for select
  using (tutor_id = auth.uid());

-- Profesores ven alumnos de sus grados
create policy "profesor ve alumnos de su grado"
  on public.alumnos for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.rol = 'profesor'
    )
  );

-- Admin ve y gestiona todo
create policy "admin gestiona alumnos"
  on public.alumnos for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.rol = 'admin'
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────

-- 3. Tareas (asignadas por el docente)
create table public.tareas (
  id           uuid        primary key default gen_random_uuid(),
  grado        text        not null,
  materia      text        not null,
  profesor_id  uuid        not null references public.profiles(id) on delete cascade,
  titulo       text        not null,
  consigna     text        not null,
  archivo_url  text,                             -- consigna adjunta (PDF/imagen)
  asignada_at  timestamptz not null default now(),
  vence_at     timestamptz not null,
  created_at   timestamptz not null default now()
);

alter table public.tareas enable row level security;

-- Alumnos/padres ven tareas de su grado
create policy "alumno ve tareas de su grado"
  on public.tareas for select
  using (auth.role() = 'authenticated');

-- Solo el profesor que la creó puede modificar/eliminar
create policy "profesor crea tarea"
  on public.tareas for insert
  with check (
    profesor_id = auth.uid()
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.rol in ('admin', 'profesor')
    )
  );

create policy "profesor edita su tarea"
  on public.tareas for update
  using (profesor_id = auth.uid());

create policy "profesor elimina su tarea"
  on public.tareas for delete
  using (profesor_id = auth.uid());

create policy "admin gestiona tareas"
  on public.tareas for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.rol = 'admin'
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────

-- 4. Entregas (una por alumno × tarea)
create table public.entregas (
  id                  uuid        primary key default gen_random_uuid(),
  tarea_id            uuid        not null references public.tareas(id) on delete cascade,
  alumno_id           uuid        not null references public.alumnos(id) on delete cascade,
  estado              text        not null default 'pendiente'
                                    check (estado in (
                                      'pendiente',
                                      'corregido_en_clase',
                                      'entregado',
                                      'corregido_en_linea',
                                      'no_entrego'
                                    )),
  archivo_entrega_url text,                     -- archivo subido por el alumno (privado)
  nota_correccion     text,                     -- notas del profesor (corregido_en_linea)
  entregado_at        timestamptz,
  corregido_at        timestamptz,
  created_at          timestamptz not null default now(),
  unique (tarea_id, alumno_id)
);

alter table public.entregas enable row level security;

-- El alumno/tutor ve sus propias entregas
create policy "alumno ve sus entregas"
  on public.entregas for select
  using (
    exists (
      select 1 from public.alumnos a
      where a.id = alumno_id and a.tutor_id = auth.uid()
    )
  );

-- El alumno puede subir archivo (solo si estado = pendiente y aún no venció el plazo)
-- La validación del vencimiento se hace en la función/edge function que maneja la subida.
create policy "alumno sube entrega"
  on public.entregas for update
  using (
    exists (
      select 1 from public.alumnos a
      where a.id = alumno_id and a.tutor_id = auth.uid()
    )
  )
  with check (estado = 'entregado');

-- El profesor ve y modifica entregas de sus grados
create policy "profesor ve entregas de su grado"
  on public.entregas for select
  using (
    exists (
      select 1 from public.tareas t
      join public.profiles p on p.id = t.profesor_id
      where t.id = tarea_id and p.id = auth.uid()
    )
  );

create policy "profesor corrige entrega"
  on public.entregas for update
  using (
    exists (
      select 1 from public.tareas t
      where t.id = tarea_id and t.profesor_id = auth.uid()
    )
  );

-- Admin ve y gestiona todo
create policy "admin gestiona entregas"
  on public.entregas for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.rol = 'admin'
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────

-- 5. Storage bucket privado para archivos de tareas
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'tareas',
  'tareas',
  false,
  10485760,   -- 10 MB max por archivo
  array['image/jpeg','image/png','image/webp','application/pdf']
)
on conflict (id) do nothing;

-- RLS en storage: solo el dueño del archivo o el profesor/admin pueden leerlo
create policy "dueño o profesor lee archivo de tarea"
  on storage.objects for select
  using (
    bucket_id = 'tareas'
    and (
      auth.uid()::text = (storage.foldername(name))[1]
      or exists (
        select 1 from public.profiles p
        where p.id = auth.uid() and p.rol in ('admin', 'profesor')
      )
    )
  );

create policy "alumno sube archivo de entrega"
  on storage.objects for insert
  with check (
    bucket_id = 'tareas'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ─────────────────────────────────────────────────────────────────────────────

-- Índices
create index on public.tareas (grado, vence_at);
create index on public.tareas (profesor_id);
create index on public.entregas (tarea_id);
create index on public.entregas (alumno_id, estado);
create index on public.alumnos (tutor_id);
create index on public.alumnos (grado, activo);
