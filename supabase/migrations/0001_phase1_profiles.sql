create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  rol text not null check (rol in ('admin', 'profesor', 'padre')),
  nombre_completo text not null,
  telefono text,
  avatar_url text,
  activo boolean default true,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, rol, nombre_completo, telefono, avatar_url, activo)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'rol', 'padre'),
    coalesce(new.raw_user_meta_data ->> 'nombre_completo', split_part(coalesce(new.email, ''), '@', 1)),
    nullif(new.raw_user_meta_data ->> 'telefono', ''),
    nullif(new.raw_user_meta_data ->> 'avatar_url', ''),
    true
  )
  on conflict (id) do update
  set rol = excluded.rol,
      nombre_completo = excluded.nombre_completo,
      telefono = excluded.telefono,
      avatar_url = excluded.avatar_url,
      activo = excluded.activo;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create policy "profiles_self_select"
  on public.profiles
  for select
  to authenticated
  using (id = auth.uid());

create policy "profiles_self_update"
  on public.profiles
  for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "profiles_admin_select_all"
  on public.profiles
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.profiles as admin_profile
      where admin_profile.id = auth.uid()
        and admin_profile.rol = 'admin'
        and admin_profile.activo = true
    )
  );
