-- Rol PADRE_ENCARGADO, aislamiento por colegio y vínculos muchos-a-muchos.
-- Esta migración reemplaza el tutor_id como fuente de autorización. La columna
-- se conserva temporalmente para compatibilidad, pero RLS usa guardian_students.

create table if not exists public.schools (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  slug       text not null unique,
  active     boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.schools (id, name, slug)
values (
  '00000000-0000-4000-8000-000000000001',
  'Centro Educativo Cristiano Canaán',
  'canaan'
)
on conflict (slug) do nothing;

alter table public.profiles
  add column if not exists school_id uuid references public.schools(id);

alter table public.alumnos
  add column if not exists school_id uuid references public.schools(id),
  add column if not exists turno text,
  add column if not exists avatar_url text,
  add column if not exists updated_at timestamptz not null default now();

update public.profiles
set school_id = '00000000-0000-4000-8000-000000000001'
where school_id is null;

update public.alumnos
set school_id = '00000000-0000-4000-8000-000000000001'
where school_id is null;

alter table public.profiles alter column school_id set not null;
alter table public.alumnos alter column school_id set not null;

alter table public.profiles drop constraint if exists profiles_rol_check;
update public.profiles set rol = 'padre_encargado' where rol = 'padre';
alter table public.profiles
  add constraint profiles_rol_check
  check (rol in ('admin', 'profesor', 'padre_encargado'));

-- Solo app_metadata (gestionada por el backend de Auth) puede definir rol.
-- raw_user_meta_data no se usa para evitar autoasignación de privilegios.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_role text;
  requested_school uuid;
begin
  requested_role := coalesce(new.raw_app_meta_data ->> 'rol', 'padre_encargado');
  if requested_role not in ('admin', 'profesor', 'padre_encargado') then
    requested_role := 'padre_encargado';
  end if;

  begin
    requested_school := nullif(new.raw_app_meta_data ->> 'school_id', '')::uuid;
  exception when invalid_text_representation then
    requested_school := null;
  end;

  if requested_school is null
     or not exists (select 1 from public.schools where id = requested_school and active = true) then
    requested_school := '00000000-0000-4000-8000-000000000001';
  end if;

  insert into public.profiles (
    id,
    rol,
    nombre_completo,
    telefono,
    avatar_url,
    activo,
    school_id
  )
  values (
    new.id,
    requested_role,
    coalesce(new.raw_user_meta_data ->> 'nombre_completo', split_part(coalesce(new.email, ''), '@', 1)),
    nullif(new.raw_user_meta_data ->> 'telefono', ''),
    nullif(new.raw_user_meta_data ->> 'avatar_url', ''),
    true,
    requested_school
  )
  on conflict (id) do update
  set nombre_completo = excluded.nombre_completo,
      telefono = excluded.telefono,
      avatar_url = excluded.avatar_url;

  return new;
end;
$$;

create table if not exists public.guardian_students (
  id                 uuid primary key default gen_random_uuid(),
  guardian_user_id   uuid not null references public.profiles(id) on delete cascade,
  student_id         uuid not null references public.alumnos(id) on delete cascade,
  relationship_type  text not null
    check (relationship_type in ('Padre', 'Madre', 'Tutor', 'Encargado', 'Abuelo/a', 'Otro')),
  is_primary         boolean not null default false,
  status             text not null default 'active'
    check (status in ('active', 'inactive')),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  unique (guardian_user_id, student_id)
);

create unique index if not exists guardian_students_one_primary
  on public.guardian_students (student_id)
  where is_primary = true and status = 'active';

create index if not exists guardian_students_guardian_active
  on public.guardian_students (guardian_user_id, status);

create index if not exists guardian_students_student_active
  on public.guardian_students (student_id, status);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists guardian_students_set_updated_at on public.guardian_students;
create trigger guardian_students_set_updated_at
  before update on public.guardian_students
  for each row execute function public.set_updated_at();

drop trigger if exists alumnos_set_updated_at on public.alumnos;
create trigger alumnos_set_updated_at
  before update on public.alumnos
  for each row execute function public.set_updated_at();

create or replace function public.validate_guardian_student_link()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  guardian_school uuid;
  guardian_role text;
  guardian_active boolean;
  student_school uuid;
begin
  select school_id, rol, activo
  into guardian_school, guardian_role, guardian_active
  from public.profiles
  where id = new.guardian_user_id;

  select school_id
  into student_school
  from public.alumnos
  where id = new.student_id;

  if guardian_role <> 'padre_encargado' or guardian_active is not true then
    raise exception 'El usuario no es un padre o encargado activo'
      using errcode = '23514';
  end if;

  if guardian_school is null or student_school is null or guardian_school <> student_school then
    raise exception 'El encargado y el alumno deben pertenecer al mismo colegio'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

drop trigger if exists guardian_students_validate_link on public.guardian_students;
create trigger guardian_students_validate_link
  before insert or update on public.guardian_students
  for each row execute function public.validate_guardian_student_link();

-- Migrar vínculos simples anteriores sin duplicarlos.
insert into public.guardian_students (
  guardian_user_id,
  student_id,
  relationship_type,
  is_primary,
  status
)
select
  a.tutor_id,
  a.id,
  'Tutor',
  true,
  'active'
from public.alumnos a
join public.profiles p on p.id = a.tutor_id
where a.tutor_id is not null
  and p.rol = 'padre_encargado'
  and p.school_id = a.school_id
on conflict (guardian_user_id, student_id) do nothing;

create or replace function public.current_school_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select school_id
  from public.profiles
  where id = auth.uid() and activo = true
$$;

create or replace function public.is_same_school_admin(target_school_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and rol = 'admin'
      and activo = true
      and school_id = target_school_id
  )
$$;

create or replace function public.is_same_school_teacher(target_school_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and rol = 'profesor'
      and activo = true
      and school_id = target_school_id
  )
$$;

create or replace function public.guardian_student_accessible(target_student_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.guardian_students gs
    join public.profiles guardian on guardian.id = gs.guardian_user_id
    join public.alumnos student on student.id = gs.student_id
    where guardian.id = auth.uid()
      and guardian.rol = 'padre_encargado'
      and guardian.activo = true
      and gs.student_id = target_student_id
      and gs.status = 'active'
      and student.activo = true
      and student.school_id = guardian.school_id
  )
$$;

create or replace function public.guardian_grade_accessible(
  target_school_id uuid,
  target_grade text
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.guardian_students gs
    join public.profiles guardian on guardian.id = gs.guardian_user_id
    join public.alumnos student on student.id = gs.student_id
    where guardian.id = auth.uid()
      and guardian.rol = 'padre_encargado'
      and guardian.activo = true
      and gs.status = 'active'
      and student.activo = true
      and student.school_id = target_school_id
      and student.school_id = guardian.school_id
      and student.grado = target_grade
  )
$$;

-- API backend: diferencia un alumno inexistente/fuera del colegio de uno no vinculado.
create or replace function public.authorize_guardian_student(p_student_id uuid)
returns text
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  guardian_profile public.profiles%rowtype;
  student_record public.alumnos%rowtype;
begin
  select * into guardian_profile
  from public.profiles
  where id = auth.uid();

  if guardian_profile.id is null
     or guardian_profile.rol <> 'padre_encargado'
     or guardian_profile.activo is not true then
    return 'forbidden';
  end if;

  select * into student_record
  from public.alumnos
  where id = p_student_id
    and school_id = guardian_profile.school_id
    and activo = true;

  if student_record.id is null then
    return 'not_found';
  end if;

  if public.guardian_student_accessible(p_student_id) then
    return 'allowed';
  end if;

  return 'forbidden';
end;
$$;

alter table public.guardian_students enable row level security;

drop policy if exists "guardian_selects_own_links" on public.guardian_students;
create policy "guardian_selects_own_links"
  on public.guardian_students for select
  to authenticated
  using (guardian_user_id = auth.uid() and status = 'active');

drop policy if exists "admin_manages_guardian_links" on public.guardian_students;
create policy "admin_manages_guardian_links"
  on public.guardian_students for all
  to authenticated
  using (
    public.is_same_school_admin(
      (select school_id from public.alumnos where id = student_id)
    )
  )
  with check (
    public.is_same_school_admin(
      (select school_id from public.alumnos where id = student_id)
    )
  );

drop policy if exists "tutor ve sus alumnos" on public.alumnos;
drop policy if exists "guardian_reads_assigned_students" on public.alumnos;
create policy "guardian_reads_assigned_students"
  on public.alumnos for select
  to authenticated
  using (public.guardian_student_accessible(id));

drop policy if exists "admin gestiona alumnos" on public.alumnos;
create policy "admin_manages_same_school_students"
  on public.alumnos for all
  to authenticated
  using (public.is_same_school_admin(school_id))
  with check (public.is_same_school_admin(school_id));

drop policy if exists "profesor ve alumnos de su grado" on public.alumnos;
create policy "teacher_reads_same_school_students"
  on public.alumnos for select
  to authenticated
  using (public.is_same_school_teacher(school_id));

drop policy if exists "profiles_admin_select_all" on public.profiles;
create policy "profiles_admin_select_same_school"
  on public.profiles for select
  to authenticated
  using (
    id = auth.uid()
    or public.is_same_school_admin(school_id)
  );

-- Impide que un usuario se otorgue otro rol o cambie de colegio desde el cliente.
revoke update on public.profiles from authenticated;
grant update (nombre_completo, telefono, avatar_url) on public.profiles to authenticated;

-- Datos académicos específicos del alumno.
create table if not exists public.calificaciones (
  id           uuid primary key default gen_random_uuid(),
  school_id    uuid not null references public.schools(id),
  alumno_id    uuid not null references public.alumnos(id) on delete cascade,
  materia      text not null,
  periodo      text not null,
  nota         numeric(5,2) not null,
  observacion  text,
  profesor_id  uuid references public.profiles(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists public.asistencias (
  id             uuid primary key default gen_random_uuid(),
  school_id      uuid not null references public.schools(id),
  alumno_id      uuid not null references public.alumnos(id) on delete cascade,
  fecha          date not null,
  estado         text not null check (estado in ('presente', 'ausente', 'tardanza', 'justificado')),
  observacion    text,
  registrado_por uuid references public.profiles(id) on delete set null,
  created_at     timestamptz not null default now(),
  unique (alumno_id, fecha)
);

create table if not exists public.materias (
  id          uuid primary key default gen_random_uuid(),
  school_id   uuid not null references public.schools(id),
  nombre      text not null,
  grado       text not null,
  profesor_id uuid references public.profiles(id) on delete set null,
  activo      boolean not null default true,
  unique (school_id, grado, nombre)
);

create table if not exists public.horarios (
  id          uuid primary key default gen_random_uuid(),
  school_id   uuid not null references public.schools(id),
  materia_id  uuid not null references public.materias(id) on delete cascade,
  grado       text not null,
  seccion     text,
  turno       text,
  dia_semana  smallint not null check (dia_semana between 1 and 7),
  hora_inicio time not null,
  hora_fin    time not null,
  aula        text
);

create table if not exists public.comunicados (
  id           uuid primary key default gen_random_uuid(),
  school_id    uuid not null references public.schools(id),
  titulo       text not null,
  contenido    text not null,
  grado        text,
  autor_id     uuid references public.profiles(id) on delete set null,
  publicado_at timestamptz not null default now(),
  activo       boolean not null default true
);

create table if not exists public.pagos (
  id           uuid primary key default gen_random_uuid(),
  school_id    uuid not null references public.schools(id),
  alumno_id    uuid not null references public.alumnos(id) on delete cascade,
  concepto     text not null,
  monto        numeric(12,2) not null,
  moneda       text not null default 'PYG',
  vencimiento  date,
  estado       text not null check (estado in ('pendiente', 'pagado', 'vencido', 'anulado')),
  pagado_at    timestamptz,
  created_at   timestamptz not null default now()
);

create table if not exists public.documentos_alumno (
  id          uuid primary key default gen_random_uuid(),
  school_id   uuid not null references public.schools(id),
  alumno_id   uuid not null references public.alumnos(id) on delete cascade,
  nombre      text not null,
  tipo        text not null,
  storage_path text not null,
  visible_para_encargado boolean not null default false,
  created_at  timestamptz not null default now()
);

create table if not exists public.notificaciones (
  id               uuid primary key default gen_random_uuid(),
  school_id        uuid not null references public.schools(id),
  guardian_user_id uuid not null references public.profiles(id) on delete cascade,
  alumno_id        uuid not null references public.alumnos(id) on delete cascade,
  titulo           text not null,
  mensaje          text not null,
  destino          text,
  leida_at         timestamptz,
  created_at       timestamptz not null default now()
);

insert into storage.buckets (id, name, public, file_size_limit)
values ('student-documents', 'student-documents', false, 20971520)
on conflict (id) do nothing;

drop policy if exists "guardian_reads_authorized_student_documents" on storage.objects;
create policy "guardian_reads_authorized_student_documents"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'student-documents'
    and exists (
      select 1
      from public.documentos_alumno document
      where document.storage_path = storage.objects.name
        and document.visible_para_encargado = true
        and public.guardian_student_accessible(document.alumno_id)
    )
  );

drop policy if exists "admin_manages_same_school_student_documents" on storage.objects;
create policy "admin_manages_same_school_student_documents"
  on storage.objects for all
  to authenticated
  using (
    bucket_id = 'student-documents'
    and exists (
      select 1
      from public.documentos_alumno document
      where document.storage_path = storage.objects.name
        and public.is_same_school_admin(document.school_id)
    )
  )
  with check (
    bucket_id = 'student-documents'
    and (storage.foldername(name))[1] = public.current_school_id()::text
  );

create or replace function public.guardian_teacher_accessible(target_teacher_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.materias subject
    where subject.profesor_id = target_teacher_id
      and subject.activo = true
      and public.guardian_grade_accessible(subject.school_id, subject.grado)
  )
$$;

drop policy if exists "guardian_reads_associated_teachers" on public.profiles;
create policy "guardian_reads_associated_teachers"
  on public.profiles for select
  to authenticated
  using (
    rol = 'profesor'
    and activo = true
    and public.guardian_teacher_accessible(id)
  );

create index if not exists calificaciones_alumno on public.calificaciones (alumno_id, created_at desc);
create index if not exists asistencias_alumno on public.asistencias (alumno_id, fecha desc);
create index if not exists horarios_grado on public.horarios (school_id, grado, seccion, dia_semana);
create index if not exists comunicados_grado on public.comunicados (school_id, grado, publicado_at desc);
create index if not exists pagos_alumno on public.pagos (alumno_id, vencimiento desc);
create index if not exists documentos_alumno_idx on public.documentos_alumno (alumno_id);
create index if not exists notificaciones_guardian on public.notificaciones (guardian_user_id, created_at desc);

alter table public.calificaciones enable row level security;
alter table public.asistencias enable row level security;
alter table public.materias enable row level security;
alter table public.horarios enable row level security;
alter table public.comunicados enable row level security;
alter table public.pagos enable row level security;
alter table public.documentos_alumno enable row level security;
alter table public.notificaciones enable row level security;

create policy "guardian_reads_student_grades"
  on public.calificaciones for select to authenticated
  using (public.guardian_student_accessible(alumno_id));
create policy "admin_manages_student_grades"
  on public.calificaciones for all to authenticated
  using (public.is_same_school_admin(school_id))
  with check (public.is_same_school_admin(school_id));

create policy "guardian_reads_student_attendance"
  on public.asistencias for select to authenticated
  using (public.guardian_student_accessible(alumno_id));
create policy "admin_manages_student_attendance"
  on public.asistencias for all to authenticated
  using (public.is_same_school_admin(school_id))
  with check (public.is_same_school_admin(school_id));

create policy "guardian_reads_student_subjects"
  on public.materias for select to authenticated
  using (activo and public.guardian_grade_accessible(school_id, grado));
create policy "admin_manages_subjects"
  on public.materias for all to authenticated
  using (public.is_same_school_admin(school_id))
  with check (public.is_same_school_admin(school_id));

create policy "guardian_reads_student_schedule"
  on public.horarios for select to authenticated
  using (public.guardian_grade_accessible(school_id, grado));
create policy "admin_manages_schedule"
  on public.horarios for all to authenticated
  using (public.is_same_school_admin(school_id))
  with check (public.is_same_school_admin(school_id));

create policy "guardian_reads_communications"
  on public.comunicados for select to authenticated
  using (
    activo
    and (
      (grado is null and school_id = public.current_school_id())
      or public.guardian_grade_accessible(school_id, grado)
    )
  );
create policy "admin_manages_communications"
  on public.comunicados for all to authenticated
  using (public.is_same_school_admin(school_id))
  with check (public.is_same_school_admin(school_id));

create policy "guardian_reads_student_payments"
  on public.pagos for select to authenticated
  using (public.guardian_student_accessible(alumno_id));
create policy "admin_manages_student_payments"
  on public.pagos for all to authenticated
  using (public.is_same_school_admin(school_id))
  with check (public.is_same_school_admin(school_id));

create policy "guardian_reads_student_documents"
  on public.documentos_alumno for select to authenticated
  using (
    visible_para_encargado
    and public.guardian_student_accessible(alumno_id)
  );
create policy "admin_manages_student_documents"
  on public.documentos_alumno for all to authenticated
  using (public.is_same_school_admin(school_id))
  with check (public.is_same_school_admin(school_id));

create policy "guardian_reads_own_notifications"
  on public.notificaciones for select to authenticated
  using (
    guardian_user_id = auth.uid()
    and public.guardian_student_accessible(alumno_id)
  );
create policy "admin_manages_notifications"
  on public.notificaciones for all to authenticated
  using (public.is_same_school_admin(school_id))
  with check (public.is_same_school_admin(school_id));

-- Endurecer tablas académicas existentes para el rol encargado.
alter table public.notas_diarias
  add column if not exists school_id uuid references public.schools(id);
alter table public.anotaciones_diarias
  add column if not exists school_id uuid references public.schools(id);
alter table public.boletin_diario
  add column if not exists school_id uuid references public.schools(id);
alter table public.boletin_semanal
  add column if not exists school_id uuid references public.schools(id);
alter table public.actividades
  add column if not exists school_id uuid references public.schools(id);
alter table public.tareas
  add column if not exists school_id uuid references public.schools(id);

update public.notas_diarias n
set school_id = p.school_id
from public.profiles p
where p.id = n.profesor_id and n.school_id is null;
update public.anotaciones_diarias n
set school_id = p.school_id
from public.profiles p
where p.id = n.profesor_id and n.school_id is null;
update public.boletin_diario b
set school_id = p.school_id
from public.profiles p
where p.id = b.profesor_id and b.school_id is null;
update public.boletin_semanal b
set school_id = p.school_id
from public.profiles p
where p.id = b.autor_id and b.school_id is null;
update public.actividades a
set school_id = p.school_id
from public.profiles p
where p.id = a.creado_por and a.school_id is null;
update public.tareas t
set school_id = p.school_id
from public.profiles p
where p.id = t.profesor_id and t.school_id is null;

update public.notas_diarias
set school_id = '00000000-0000-4000-8000-000000000001'
where school_id is null;
update public.anotaciones_diarias
set school_id = '00000000-0000-4000-8000-000000000001'
where school_id is null;
update public.boletin_diario
set school_id = '00000000-0000-4000-8000-000000000001'
where school_id is null;
update public.boletin_semanal
set school_id = '00000000-0000-4000-8000-000000000001'
where school_id is null;
update public.actividades
set school_id = '00000000-0000-4000-8000-000000000001'
where school_id is null;
update public.tareas
set school_id = '00000000-0000-4000-8000-000000000001'
where school_id is null;

alter table public.notas_diarias alter column school_id set not null;
alter table public.anotaciones_diarias alter column school_id set not null;
alter table public.boletin_diario alter column school_id set not null;
alter table public.boletin_semanal alter column school_id set not null;
alter table public.actividades alter column school_id set not null;
alter table public.tareas alter column school_id set not null;

alter table public.notas_diarias
  drop constraint if exists notas_diarias_alumno_id_fkey;
alter table public.notas_diarias
  add constraint notas_diarias_alumno_id_fkey
  foreign key (alumno_id) references public.alumnos(id) on delete set null not valid;

drop policy if exists "padre ve notas de su grado" on public.notas_diarias;
drop policy if exists "admin gestiona notas" on public.notas_diarias;
create policy "guardian_reads_student_notes"
  on public.notas_diarias for select to authenticated
  using (alumno_id is not null and public.guardian_student_accessible(alumno_id));
create policy "admin_manages_same_school_notes"
  on public.notas_diarias for all to authenticated
  using (public.is_same_school_admin(school_id))
  with check (public.is_same_school_admin(school_id));

drop policy if exists "alumno ve anotaciones completadas" on public.anotaciones_diarias;
drop policy if exists "admin gestiona anotaciones" on public.anotaciones_diarias;
create policy "guardian_reads_completed_annotations"
  on public.anotaciones_diarias for select to authenticated
  using (
    estado = 'completada'
    and alumno_id is not null
    and public.guardian_student_accessible(alumno_id)
  );
create policy "admin_manages_same_school_annotations"
  on public.anotaciones_diarias for all to authenticated
  using (public.is_same_school_admin(school_id))
  with check (public.is_same_school_admin(school_id));

drop policy if exists "alumno ve sus entregas" on public.entregas;
drop policy if exists "alumno sube entrega" on public.entregas;
drop policy if exists "admin gestiona entregas" on public.entregas;
create policy "guardian_reads_student_submissions"
  on public.entregas for select to authenticated
  using (public.guardian_student_accessible(alumno_id));
create policy "admin_manages_same_school_submissions"
  on public.entregas for all to authenticated
  using (
    exists (
      select 1 from public.tareas
      where tareas.id = entregas.tarea_id
        and public.is_same_school_admin(tareas.school_id)
    )
  )
  with check (
    exists (
      select 1 from public.tareas
      where tareas.id = entregas.tarea_id
        and public.is_same_school_admin(tareas.school_id)
    )
  );

drop policy if exists "padre ve actividades" on public.actividades;
drop policy if exists "profesor ve actividades" on public.actividades;
drop policy if exists "admin gestiona actividades" on public.actividades;
create policy "guardian_reads_student_activities"
  on public.actividades for select to authenticated
  using (
    (grado is null and school_id = public.current_school_id())
    or public.guardian_grade_accessible(school_id, grado)
  );
create policy "teacher_reads_same_school_activities"
  on public.actividades for select to authenticated
  using (public.is_same_school_teacher(school_id));
create policy "admin_manages_same_school_activities"
  on public.actividades for all to authenticated
  using (public.is_same_school_admin(school_id))
  with check (public.is_same_school_admin(school_id));

drop policy if exists "alumno ve tareas de su grado" on public.tareas;
drop policy if exists "admin gestiona tareas" on public.tareas;
create policy "guardian_reads_student_assignments"
  on public.tareas for select to authenticated
  using (public.guardian_grade_accessible(school_id, grado));
create policy "teacher_reads_same_school_assignments"
  on public.tareas for select to authenticated
  using (public.is_same_school_teacher(school_id));
create policy "admin_manages_same_school_assignments"
  on public.tareas for all to authenticated
  using (public.is_same_school_admin(school_id))
  with check (public.is_same_school_admin(school_id));

drop policy if exists "autenticados ven boletin" on public.boletin_semanal;
drop policy if exists "admin gestiona boletin" on public.boletin_semanal;
create policy "guardian_reads_published_weekly_bulletin"
  on public.boletin_semanal for select to authenticated
  using (
    estado = 'publicado'
    and (
      (grado is null and school_id = public.current_school_id())
      or public.guardian_grade_accessible(school_id, grado)
    )
  );
create policy "admin_manages_same_school_weekly_bulletin"
  on public.boletin_semanal for all to authenticated
  using (public.is_same_school_admin(school_id))
  with check (public.is_same_school_admin(school_id));

drop policy if exists "alumno ve boletin diario publicado" on public.boletin_diario;
drop policy if exists "admin gestiona boletin diario" on public.boletin_diario;
create policy "guardian_reads_published_daily_bulletin"
  on public.boletin_diario for select to authenticated
  using (
    estado = 'publicado'
    and public.guardian_grade_accessible(school_id, grado)
  );
create policy "admin_manages_same_school_daily_bulletin"
  on public.boletin_diario for all to authenticated
  using (public.is_same_school_admin(school_id))
  with check (public.is_same_school_admin(school_id));

grant select on public.schools to authenticated;
grant select on public.guardian_students to authenticated;
grant insert, update, delete on public.guardian_students to authenticated;
grant select on public.alumnos to authenticated;
grant select on public.calificaciones to authenticated;
grant select on public.asistencias to authenticated;
grant select on public.materias to authenticated;
grant select on public.horarios to authenticated;
grant select on public.comunicados to authenticated;
grant select on public.pagos to authenticated;
grant select on public.documentos_alumno to authenticated;
grant select on public.notificaciones to authenticated;
grant all on public.calificaciones to authenticated;
grant all on public.asistencias to authenticated;
grant all on public.materias to authenticated;
grant all on public.horarios to authenticated;
grant all on public.comunicados to authenticated;
grant all on public.pagos to authenticated;
grant all on public.documentos_alumno to authenticated;
grant all on public.notificaciones to authenticated;
grant execute on function public.authorize_guardian_student(uuid) to authenticated;
grant execute on function public.guardian_student_accessible(uuid) to authenticated;
grant execute on function public.guardian_grade_accessible(uuid, text) to authenticated;
