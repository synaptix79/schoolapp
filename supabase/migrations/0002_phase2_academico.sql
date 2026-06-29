-- ─────────────────────────────────────────────────────────────────────────────
-- Fase 2: tablas académicas — notas_diarias, boletin_semanal, actividades
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Notas diarias del docente
create table public.notas_diarias (
  id            uuid        primary key default gen_random_uuid(),
  grado         text        not null,
  alumno_id     uuid        references public.profiles(id) on delete set null,
  materia       text        not null,
  profesor_id   uuid        not null references public.profiles(id) on delete cascade,
  texto         text        not null,
  tipo          text        not null default 'info'
                              check (tipo in ('info', 'felicitacion', 'observacion')),
  fecha         date        not null default current_date,
  created_at    timestamptz not null default now()
);

alter table public.notas_diarias enable row level security;

-- Padres/alumnos ven notas de su grado
create policy "padre ve notas de su grado"
  on public.notas_diarias for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.rol = 'padre'
    )
  );

-- Profesores ven y crean sus propias notas
create policy "profesor ve sus notas"
  on public.notas_diarias for select
  using (profesor_id = auth.uid());

create policy "profesor crea notas"
  on public.notas_diarias for insert
  with check (profesor_id = auth.uid());

create policy "profesor actualiza sus notas"
  on public.notas_diarias for update
  using (profesor_id = auth.uid());

create policy "profesor elimina sus notas"
  on public.notas_diarias for delete
  using (profesor_id = auth.uid());

-- Admin ve todo
create policy "admin gestiona notas"
  on public.notas_diarias for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.rol = 'admin'
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────

-- 2. Boletín semanal
create table public.boletin_semanal (
  id            uuid        primary key default gen_random_uuid(),
  grado         text,                          -- null = global (toda la comunidad)
  semana_inicio date        not null,
  semana_fin    date        not null,
  resumen       text        not null,
  hitos         text[]      not null default '{}',
  autor_id      uuid        not null references public.profiles(id) on delete cascade,
  created_at    timestamptz not null default now()
);

alter table public.boletin_semanal enable row level security;

-- Todos los autenticados pueden leer
create policy "autenticados ven boletin"
  on public.boletin_semanal for select
  using (auth.role() = 'authenticated');

-- Solo admin puede crear/editar/borrar
create policy "admin gestiona boletin"
  on public.boletin_semanal for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.rol = 'admin'
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────

-- 3. Actividades (fuente unificada para calendario y recordatorios)
create table public.actividades (
  id            uuid        primary key default gen_random_uuid(),
  tipo          text        not null
                              check (tipo in ('tarea', 'examen', 'evento', 'reunion')),
  titulo        text        not null,
  descripcion   text,
  materia       text,
  grado         text,                          -- null = global (toda la comunidad)
  fecha         date        not null,
  hora          time,
  creado_por    uuid        not null references public.profiles(id) on delete cascade,
  created_at    timestamptz not null default now()
);

alter table public.actividades enable row level security;

-- Padres/alumnos ven actividades globales y de su grado
-- (el filtro por grado real se haría con un join a la tabla de inscripciones;
--  aquí usamos una policy permisiva para la fase demo)
create policy "padre ve actividades"
  on public.actividades for select
  using (
    grado is null
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.rol = 'padre'
    )
  );

-- Profesores ven y crean las suyas
create policy "profesor ve actividades"
  on public.actividades for select
  using (auth.role() = 'authenticated');

create policy "profesor crea actividades"
  on public.actividades for insert
  with check (
    creado_por = auth.uid()
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.rol in ('admin', 'profesor')
    )
  );

create policy "profesor edita sus actividades"
  on public.actividades for update
  using (creado_por = auth.uid());

create policy "profesor elimina sus actividades"
  on public.actividades for delete
  using (creado_por = auth.uid());

-- Admin ve y gestiona todo
create policy "admin gestiona actividades"
  on public.actividades for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.rol = 'admin'
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────

-- Índices de rendimiento
create index on public.notas_diarias (grado, fecha desc);
create index on public.notas_diarias (profesor_id);
create index on public.boletin_semanal (semana_inicio desc);
create index on public.actividades (fecha, grado);
