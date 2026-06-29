-- Phase 4: Docente data-entry tables
-- anotaciones_diarias, boletin_diario, and boletin_semanal workflow columns

-- ── anotaciones_diarias ───────────────────────────────────────────────────────
create table public.anotaciones_diarias (
  id          uuid        primary key default gen_random_uuid(),
  grado       text        not null,
  alumno_id   uuid        references public.alumnos(id) on delete set null,
  materia     text        not null,
  profesor_id uuid        not null references public.profiles(id) on delete cascade,
  texto       text        not null,
  tipo        text        not null default 'info'
                check (tipo in ('info', 'felicitacion', 'observacion')),
  estado      text        not null default 'borrador'
                check (estado in ('borrador', 'completada')),
  fecha       date        not null default current_date,
  created_at  timestamptz not null default now()
);

alter table public.anotaciones_diarias enable row level security;

-- Students/families: only completed annotations
create policy "alumno ve anotaciones completadas"
  on public.anotaciones_diarias for select
  using (
    estado = 'completada'
    and exists (select 1 from public.profiles where id = auth.uid() and rol = 'padre')
  );

-- Teachers: full access to their own annotations
create policy "profesor ve sus anotaciones"
  on public.anotaciones_diarias for select
  using (profesor_id = auth.uid());

create policy "profesor crea anotacion"
  on public.anotaciones_diarias for insert
  with check (
    profesor_id = auth.uid()
    and exists (select 1 from public.profiles where id = auth.uid() and rol in ('admin', 'profesor'))
  );

create policy "profesor edita su anotacion"
  on public.anotaciones_diarias for update
  using (profesor_id = auth.uid());

create policy "profesor elimina su borrador"
  on public.anotaciones_diarias for delete
  using (profesor_id = auth.uid() and estado = 'borrador');

create policy "admin gestiona anotaciones"
  on public.anotaciones_diarias for all
  using (exists (select 1 from public.profiles where id = auth.uid() and rol = 'admin'));

-- ── boletin_diario ────────────────────────────────────────────────────────────
create table public.boletin_diario (
  id          uuid        primary key default gen_random_uuid(),
  grado       text        not null,
  profesor_id uuid        not null references public.profiles(id) on delete cascade,
  fecha       date        not null default current_date,
  contenido   text        not null,
  estado      text        not null default 'borrador'
                check (estado in ('borrador', 'publicado')),
  origen      text        not null default 'manual'
                check (origen in ('auto', 'manual')),
  created_at  timestamptz not null default now(),
  unique (grado, fecha)
);

alter table public.boletin_diario enable row level security;

create policy "alumno ve boletin diario publicado"
  on public.boletin_diario for select
  using (
    estado = 'publicado'
    and exists (select 1 from public.profiles where id = auth.uid() and rol = 'padre')
  );

create policy "profesor gestiona boletin diario propio"
  on public.boletin_diario for all
  using (profesor_id = auth.uid());

create policy "admin gestiona boletin diario"
  on public.boletin_diario for all
  using (exists (select 1 from public.profiles where id = auth.uid() and rol = 'admin'));

-- ── boletin_semanal: add workflow columns ────────────────────────────────────
alter table public.boletin_semanal
  add column if not exists estado text not null default 'publicado'
    check (estado in ('borrador', 'publicado')),
  add column if not exists origen text not null default 'manual'
    check (origen in ('auto', 'editado', 'manual'));
