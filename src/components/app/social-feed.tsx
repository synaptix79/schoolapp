'use client';
import { formatAcademicLabel } from '@/lib/academic-levels';


import Link from 'next/link';
import { memo, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  CalendarPlus,
  Check,
  ClipboardList,
  Edit3,
  Eye,
  FileImage,
  GraduationCap,
  Heart,
  Megaphone,
  Pin,
  ShieldCheck,
  Trash2,
  Users,
  X
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { demoChildren, demoCommuniques } from '@/lib/demo';

type Post = (typeof demoCommuniques)[number];
type DemoChild = (typeof demoChildren)[number];
type Filter = 'todo' | 'aviso' | 'noticia' | 'evento';
type DemoWallRole = 'admin' | 'profesor' | 'alumno';

const filters: Array<{ value: Filter; label: string }> = [
  { value: 'todo', label: 'Todo' },
  { value: 'aviso', label: 'Avisos' },
  { value: 'noticia', label: 'Noticias' },
  { value: 'evento', label: 'Eventos' }
];

const teacherGrades = ['3.º EEB', '1.º EEB'];

const scopeStyles: Record<string, string> = {
  global: 'bg-accent text-primary border-border',
  grado: 'bg-primary/10 text-primary border-primary/20'
};

const roleOptions: Array<{
  role: DemoWallRole;
  label: string;
  description: string;
  icon: LucideIcon;
  activeClass: string;
}> = [
  {
    role: 'admin',
    label: 'Dirección',
    description: 'Ve todo y gestiona publicaciones.',
    icon: ShieldCheck,
    activeClass: 'border-primary/40 bg-primary/10 text-primary'
  },
  {
    role: 'profesor',
    label: 'Docente',
    description: 'Ve global + sus grados asignados.',
    icon: GraduationCap,
    activeClass: 'border-canaan-celeste/40 bg-canaan-celeste-suave text-primary'
  },
  {
    role: 'alumno',
    label: 'Alumno',
    description: 'Solo visualiza avisos de su grado.',
    icon: Users,
    activeClass: 'border-primary/40 bg-accent text-primary'
  }
];

const roleChrome: Record<DemoWallRole, {
  eyebrow: string;
  title: string;
  description: string;
  panelClass: string;
  badgeClass: string;
  avatarClass: string;
  accentText: string;
}> = {
  admin: {
    eyebrow: 'Muro · Dirección',
    title: 'Control de publicaciones de toda la comunidad',
    description: 'Vista completa: avisos globales, grados, métricas de alcance y herramientas de edición.',
    panelClass: 'border-primary/20 bg-primary/5',
    badgeClass: 'bg-primary text-primary-foreground',
    avatarClass: 'bg-primary text-primary-foreground',
    accentText: 'text-primary'
  },
  profesor: {
    eyebrow: 'Muro · Docente — Prof. Marta Benítez',
    title: 'Comunicación de tus grados asignados',
    description: 'Vista filtrada a publicaciones globales y grados 3.º grado / 1.º grado.',
    panelClass: 'border-canaan-celeste/20 bg-canaan-celeste/5',
    badgeClass: 'bg-canaan-celeste text-primary-foreground',
    avatarClass: 'bg-canaan-celeste text-primary-foreground',
    accentText: 'text-primary'
  },
  alumno: {
    eyebrow: 'Muro · Alumno — Ana López',
    title: 'Avisos y noticias para tu grado',
    description: 'Vista de solo lectura: avisos globales y comunicados dirigidos a 3.º grado.',
    panelClass: 'border-canaan-celeste/30 bg-canaan-celeste-suave/80',
    badgeClass: 'bg-primary text-primary-foreground',
    avatarClass: 'bg-primary text-primary-foreground',
    accentText: 'text-primary'
  }
};

export function DemoRoleWall({
  posts,
  childrenList = [],
  fixedRole,
  fixedChildId,
  fixedRoleLabel,
}: {
  posts: Post[];
  childrenList?: DemoChild[];
  fixedRole?: DemoWallRole;
  fixedChildId?: string;
  fixedRoleLabel?: string;
}) {
  const [selectedRole, setSelectedRole] = useState<DemoWallRole>('admin');
  const role = fixedRole ?? selectedRole;
  const selectedChild = childrenList.find((child) => child.id === fixedChildId) ?? childrenList[0];
  const baseChrome = roleChrome[role];
  const chrome = role === 'alumno' && selectedChild
    ? {
        ...baseChrome,
        eyebrow: `Muro · ${fixedRoleLabel ?? 'Alumno'} — ${selectedChild.nombre}`,
        description: `Vista de solo lectura: avisos globales y comunicados dirigidos a ${formatAcademicLabel(selectedChild.grado)}.`,
      }
    : baseChrome;

  const visiblePosts = useMemo(() => {
    if (role === 'admin') {
      return posts;
    }

    if (role === 'profesor') {
      return posts.filter((post) => post.scope === 'global' || post.grades.some((grade) => teacherGrades.includes(grade)));
    }

    return posts.filter((post) => post.scope === 'global' || post.grades.includes(selectedChild?.grado ?? '3.º EEB'));
  }, [posts, role, selectedChild?.grado]);

  return (
    <div className="space-y-3 sm:space-y-4">
      {!fixedRole ? (
        <section className="overflow-hidden rounded-lg border border-border bg-card/95 p-2 shadow-soft sm:p-4">
          <div className="mb-2 flex items-center justify-between gap-3 px-1 sm:mb-3 sm:px-0">
            <div>
              <p className="text-sm font-bold text-foreground">Vista demo por perfil</p>
              <p className="hidden text-sm text-muted-foreground sm:block">En la versión final esto se asigna automáticamente; aquí se elige manualmente para revisar.</p>
            </div>
            <span className="hidden rounded-md bg-muted px-3 py-1 text-xs font-bold text-muted-foreground sm:inline-flex">Versión final</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {roleOptions.map((option) => {
              const Icon = option.icon;
              const active = role === option.role;

              return (
                <button
                  key={option.role}
                  type="button"
                  onClick={() => setSelectedRole(option.role)}
                  className={cn(
                    'flex min-h-12 min-w-0 flex-col items-center justify-center gap-1 rounded-md border px-1.5 py-2 text-center transition-colors sm:min-h-20 sm:flex-row sm:items-start sm:justify-start sm:gap-3 sm:p-3 sm:text-left',
                    active ? option.activeClass : 'border-border bg-background text-foreground hover:bg-muted'
                  )}
                >
                  <Icon className="size-4 shrink-0 sm:mt-0.5 sm:size-5" aria-hidden />
                  <span className="min-w-0">
                    <span className="block break-words text-xs font-black sm:text-base">{option.label}</span>
                    <span className="mt-1 hidden text-xs leading-5 opacity-80 md:block">{option.description}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className={cn('rounded-lg border p-3 shadow-soft sm:p-5', chrome.panelClass)}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <p className={cn('text-sm font-black', chrome.accentText)}>{chrome.eyebrow}</p>
            <h1 className="mt-1 text-xl font-black leading-tight text-foreground sm:text-3xl">{chrome.title}</h1>
            <p className="mt-2 hidden text-sm leading-6 text-muted-foreground sm:block">{chrome.description}</p>
          </div>
          <span className={cn('w-fit rounded-md px-3 py-1.5 text-xs font-black shadow-soft sm:py-2', chrome.badgeClass)}>
            {visiblePosts.length} publicaciones visibles
          </span>
        </div>

        <RoleToolbar role={role} selectedChild={selectedChild} />
      </section>

      {role !== 'alumno' ? <QuickOverview role={role} /> : null}

      <SocialFeed posts={visiblePosts} role={role} avatarClass={chrome.avatarClass} />
    </div>
  );
}

function QuickOverview({ role }: { role: Exclude<DemoWallRole, 'alumno'> }) {
  const isAdmin = role === 'admin';

  const tiles = isAdmin
    ? [
        { label: 'Alumnos activos', value: '428', detail: '+18 este año', tone: 'neutral' },
        { label: 'Asistencia del día', value: '94%', detail: 'Inicial · EEB · Medio', tone: 'neutral' },
        { label: 'Avisos esta semana', value: '7', detail: '3 por grado', tone: 'neutral' },
        { label: 'Docentes sin cargar notas', value: '2', detail: 'Requiere seguimiento', tone: 'warning' }
      ]
    : [
        { label: 'Próxima clase', value: '09:30', detail: 'Ciencias · 3.º grado A', tone: 'neutral' },
        { label: 'Mis alumnos', value: '59', detail: '2 grados asignados', tone: 'neutral' },
        { label: 'Asistencia', value: 'Opcional', detail: 'Llamar solo cuando lo necesites', tone: 'neutral' },
        { label: 'Materias sin notas', value: '2', detail: 'Matemática · Comunicación', tone: 'warning' },
        { label: 'Fotos por subir', value: '6', detail: 'Actividad de aula', tone: 'neutral' }
      ];

  const tools = isAdmin
    ? [
        { href: '/admin/reportes', label: 'Reportes', icon: Eye },
        { href: '/admin/usuarios', label: 'Gestión de usuarios', icon: Users },
        { href: '/admin/avisos', label: 'Publicar comunicado global', icon: Megaphone }
      ]
    : [
        { href: '/profesor/asistencia', label: 'Llamar asistencia', icon: Check },
        { href: '/profesor/calificaciones', label: 'Cargar notas', icon: ClipboardList },
        { href: '/profesor/galeria', label: 'Entregables', icon: FileImage }
      ];

  return (
    <section className={cn('rounded-lg border bg-card p-3 shadow-soft sm:p-4', isAdmin ? 'border-primary/20' : 'border-canaan-celeste/20')}>
      <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-black text-primary">Vistazo rápido</p>
          <h2 className="text-lg font-bold text-foreground">
            {isAdmin ? 'Control de la institución' : 'Operación docente del día'}
          </h2>
        </div>
        <p className="text-xs font-semibold text-muted-foreground">
          {isAdmin ? 'Solo Dirección' : 'Solo Docentes'}
        </p>
      </div>

      <div className={cn('grid grid-cols-2 gap-2', isAdmin ? 'lg:grid-cols-4' : 'lg:grid-cols-5')}>
        {tiles.map((tile) => (
          <OverviewTile key={tile.label} {...tile} />
        ))}
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {tools.map((tool) => {
          const Icon = tool.icon;

          return (
            <Link
              key={tool.href}
              href={tool.href}
              className={cn(
                'flex min-h-11 items-center justify-center gap-2 rounded-md border px-3 text-center text-sm font-bold leading-tight transition-colors',
                isAdmin
                  ? 'border-primary/20 bg-primary/5 text-primary hover:bg-primary/10'
                  : 'border-canaan-celeste/20 bg-canaan-celeste/5 text-foreground hover:bg-canaan-celeste/10'
              )}
            >
              <Icon className="size-4" aria-hidden />
              {tool.label}
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function OverviewTile({ label, value, detail, tone }: { label: string; value: string; detail: string; tone: string }) {
  return (
    <div className={cn('rounded-md border p-2.5 sm:p-3', tone === 'warning' ? 'border-canaan-alerta/35 bg-canaan-alerta-suave' : 'border-border bg-background')}>
      <p className="text-xs font-bold text-muted-foreground">{label}</p>
      <p className={cn('mt-1 text-lg font-black leading-tight sm:text-xl', tone === 'warning' ? 'text-canaan-alerta' : 'text-foreground')}>{value}</p>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">{detail}</p>
    </div>
  );
}

function RoleToolbar({ role, selectedChild }: { role: DemoWallRole; selectedChild?: DemoChild }) {
  if (role === 'admin') {
    return (
      <div className="mt-3 grid gap-3 sm:mt-5 lg:grid-cols-[1fr_0.8fr]">
        <Link href="/admin/avisos" className="flex min-h-14 items-center gap-3 rounded-lg border border-primary/20 bg-card/90 p-3 shadow-soft transition-colors hover:bg-card sm:min-h-16 sm:p-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Megaphone className="size-5" aria-hidden />
          </span>
          <span>
            <span className="block font-bold text-foreground">Publicar aviso o noticia...</span>
            <span className="text-sm text-muted-foreground">Global, un grado o varios grados.</span>
          </span>
        </Link>
        <div className="hidden gap-3 sm:grid sm:grid-cols-2">
          <InfoPill icon={ClipboardList} title="2 docentes pendientes" description="Aún no cargaron notas" />
          <InfoPill icon={Eye} title="89% visto" description="Alcance promedio" />
        </div>
      </div>
    );
  }

  if (role === 'profesor') {
    return (
      <div className="mt-3 grid gap-3 sm:mt-5 lg:grid-cols-[1fr_0.95fr]">
        <Link href="/profesor/avisos" className="flex min-h-14 items-center gap-3 rounded-lg border border-canaan-celeste/20 bg-card/90 p-3 shadow-soft transition-colors hover:bg-card sm:min-h-16 sm:p-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-canaan-celeste text-primary-foreground">
            <Megaphone className="size-5" aria-hidden />
          </span>
          <span>
            <span className="block font-bold text-foreground">Publicar para mis grados...</span>
            <span className="text-sm text-muted-foreground">Limitado a 3.º grado A y 1.º grado B.</span>
          </span>
        </Link>
        <div className="grid gap-2 sm:grid-cols-3 sm:gap-3">
          <ToolbarLink href="/profesor/calificaciones" icon={ClipboardList} label="Cargar notas" />
          <ToolbarLink href="/profesor/galeria" icon={FileImage} label="Entregables" />
          <InfoPill icon={ClipboardList} title="Pendiente" description="Matemática · 3.º grado" compact />
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-lg border border-canaan-celeste/25 bg-card/90 p-3 shadow-soft sm:mt-5 sm:p-4">
      <div className="flex flex-col gap-1">
        <p className="font-bold text-foreground">{selectedChild?.nombre ?? 'Ana López'}</p>
        <p className="text-sm text-muted-foreground">
          {formatAcademicLabel(selectedChild?.grado ?? '3.º EEB')} · Sección {selectedChild?.seccion ?? 'A'} · solo lectura
        </p>
      </div>
    </div>
  );
}

function ToolbarLink({ href, icon: Icon, label }: { href: string; icon: LucideIcon; label: string }) {
  return (
    <Link href={href} className="flex min-h-16 items-center gap-2 rounded-lg border border-canaan-celeste/20 bg-card/90 p-3 text-sm font-bold text-foreground shadow-soft transition-colors hover:bg-card">
      <Icon className="size-4 shrink-0 text-primary" aria-hidden />
      {label}
    </Link>
  );
}

function InfoPill({ icon: Icon, title, description, compact = false }: { icon: LucideIcon; title: string; description: string; compact?: boolean }) {
  return (
    <div className={cn('flex items-center gap-3 rounded-lg border border-border bg-card/90 p-3 shadow-soft', compact && 'min-h-16')}>
      <Icon className="size-4 shrink-0 text-primary" aria-hidden />
      <span>
        <span className="block text-sm font-bold text-foreground">{title}</span>
        <span className="block text-xs leading-5 text-muted-foreground">{description}</span>
      </span>
    </div>
  );
}

function SocialFeed({ posts, role, avatarClass }: { posts: Post[]; role: DemoWallRole; avatarClass: string }) {
  const [filter, setFilter] = useState<Filter>('todo');
  const gridRef = useRef<HTMLDivElement>(null);

  const filteredPosts = useMemo(() => {
    const visible = filter === 'todo' ? posts : posts.filter((post) => post.category === filter);
    return [...visible].sort((a, b) => Number(b.pinned) - Number(a.pinned));
  }, [filter, posts]);

  useLayoutEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    if (!filteredPosts.length) {
      grid.style.gridAutoRows = '';
      grid.style.rowGap = '';
      return;
    }

    // One-pixel tracks let each card end independently while retaining DOM order.
    // The wrapper includes the 16px vertical gutter in its measured height.
    const items = Array.from(grid.children) as HTMLElement[];
    const measure = (item: HTMLElement) => {
      item.style.gridRowEnd = `span ${Math.ceil(item.getBoundingClientRect().height)}`;
    };
    items.forEach(measure);
    grid.style.gridAutoRows = '1px';
    grid.style.rowGap = '0px';

    const observer = new ResizeObserver((entries) => {
      entries.forEach((entry) => measure(entry.target as HTMLElement));
    });
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, [filteredPosts]);

  return (
    <section className="space-y-3">
      <div className="rounded-lg border border-border bg-card p-3 shadow-soft">
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          {filters.map((item) => {
            const active = filter === item.value;

            return (
              <button
                key={item.value}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(item.value)}
                className={cn(
                  'min-h-11 min-w-0 rounded-md border px-4 text-sm font-bold transition-colors',
                  active ? 'border-primary bg-primary text-primary-foreground shadow-soft' : 'border-border bg-card text-foreground hover:bg-muted'
                )}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <div ref={gridRef} className="mx-auto grid w-full max-w-[1200px] grid-cols-[repeat(auto-fill,minmax(min(100%,420px),1fr))] items-start gap-x-4">
        {filteredPosts.length ? (
          filteredPosts.map((post) => (
            <div key={post.id} className="min-w-0 pb-4">
              <SocialPost post={post} role={role} avatarClass={avatarClass} />
            </div>
          ))
        ) : (
          <div className="col-span-full rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground shadow-soft">
            No hay publicaciones para este filtro.
          </div>
        )}
      </div>
    </section>
  );
}

const SocialPost = memo(function SocialPost({ post, role, avatarClass }: { post: Post; role: DemoWallRole; avatarClass: string }) {
  const [liked, setLiked] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const isLongBody = post.body.length > 240;
  const previewBody = isLongBody ? `${post.body.slice(0, 240).trimEnd()}…` : post.body;
  const reactionCount = post.reactions + (liked ? 1 : 0);
  const scopeLabel = post.scope === 'global' ? 'Global' : post.grades.map(formatAcademicLabel).join(', ');
  const canManage = role === 'admin' || (role === 'profesor' && post.author.startsWith('Prof.'));
  const canReact = role !== 'alumno';
  const showEventActions = role !== 'alumno' && post.category === 'evento';

  return (
    <article className={cn('min-w-0 overflow-hidden rounded-lg border bg-card shadow-soft', post.pinned ? 'border-primary/30' : 'border-border/80')}>
      {post.pinned ? (
        <div className="flex items-center gap-2 border-b border-primary/20 bg-primary/10 px-4 py-2 text-xs font-bold text-primary sm:px-5">
          <Pin className="size-3.5" aria-hidden />
          Fijado
        </div>
      ) : null}

      <div className="p-4 pb-3 sm:p-5 sm:pb-4">
        <div className="flex items-start gap-3">
          <div className={cn('flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-black shadow-soft', avatarClass)}>
            {post.authorInitials}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <Link href={`/aviso/${post.id}`} className="block break-words font-bold text-foreground hover:text-primary">
                  {post.author}
                </Link>
                <div className="text-xs font-medium text-muted-foreground" title={post.exactTime}>
                  {post.relativeTime}
                </div>
              </div>
              <span className={cn('max-w-full rounded-full border px-2.5 py-1 text-xs font-bold [overflow-wrap:anywhere]', scopeStyles[post.scope])}>
                {scopeLabel}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-3 min-w-0">
          <Link href={`/aviso/${post.id}`} className="block text-lg font-bold leading-snug text-foreground hover:text-primary [overflow-wrap:anywhere]">
            <h2>{formatAcademicLabel(post.title)}</h2>
          </Link>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground [overflow-wrap:anywhere]">{expanded ? post.body : previewBody}</p>
          {isLongBody ? (
            <button type="button" onClick={() => setExpanded((current) => !current)} aria-expanded={expanded} className="mt-1 text-sm font-bold text-primary hover:underline">
              {expanded ? 'Ver menos' : 'Ver más'}
            </button>
          ) : null}
        </div>
      </div>

      {post.image ? <PostImage variant={post.image} title={formatAcademicLabel(post.title)} /> : null}

      <footer className="space-y-3 border-t border-border px-4 py-3 sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {canReact ? (
            <button
              type="button"
              onClick={() => setLiked((current) => !current)}
              className={cn(
                'inline-flex h-10 items-center gap-2 rounded-md px-3 text-sm font-bold transition-colors',
                liked ? 'bg-accent text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <span className={cn('inline-flex', liked && 'animate-like-pop')}>
                <Heart className={cn('size-5', liked && 'fill-current')} aria-hidden />
              </span>
              {reactionCount}
            </button>
          ) : (
            <span className="inline-flex h-10 items-center gap-2 rounded-md px-3 text-sm font-bold text-muted-foreground">
              <Heart className="size-5" aria-hidden />
              {reactionCount}
            </span>
          )}

          <div className="flex items-center gap-3">
            {role === 'admin' ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground">
                <Eye className="size-4" aria-hidden />
                89% visto
              </span>
            ) : null}
            <Link href={`/aviso/${post.id}`} className="text-sm font-bold text-primary">
              Ver detalle
            </Link>
          </div>
        </div>

        {showEventActions ? (
          <div className="grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setConfirmed((current) => !current)}
              className={cn(
                'inline-flex h-10 items-center justify-center gap-2 rounded-md border px-3 text-sm font-bold transition-colors',
                confirmed ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-foreground hover:bg-muted'
              )}
            >
              <Check className="size-4" aria-hidden />
              {confirmed ? 'Asistencia confirmada' : 'Confirmar asistencia'}
            </button>
            <button type="button" className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border bg-card px-3 text-sm font-bold text-foreground transition-colors hover:bg-muted">
              <CalendarPlus className="size-4" aria-hidden />
              Agendar
            </button>
          </div>
        ) : null}

        {canManage ? (
          <div className="flex flex-wrap gap-2 border-t border-border pt-3">
            <button className="inline-flex h-8 items-center gap-1 rounded-md border border-border px-2.5 text-xs font-bold text-foreground hover:bg-muted" type="button">
              <Edit3 className="size-3.5" aria-hidden />
              Editar
            </button>
            <button className="inline-flex h-8 items-center gap-1 rounded-md border border-border px-2.5 text-xs font-bold text-foreground hover:bg-muted" type="button">
              <Pin className="size-3.5" aria-hidden />
              Fijar
            </button>
            {role === 'admin' ? (
              <button className="inline-flex h-8 items-center gap-1 rounded-md border border-canaan-alerta/35 px-2.5 text-xs font-bold text-canaan-alerta hover:bg-canaan-alerta-suave" type="button">
                <Trash2 className="size-3.5" aria-hidden />
                Borrar
              </button>
            ) : null}
          </div>
        ) : null}
      </footer>
    </article>
  );
});

function PostImage({ variant, title }: { variant: string; title: string }) {
  const label = imageLabel(variant);
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label={`Ampliar ilustración: ${title}`} className="relative block aspect-video max-h-[280px] w-full overflow-hidden border-y border-border/80 bg-canaan-celeste-suave text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
        <PostScene variant={variant} />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-canaan-texto/90 via-canaan-texto/62 to-transparent p-4">
          <span className="inline-flex rounded-full bg-card/95 px-3 py-1 text-xs font-bold text-foreground shadow-soft">{label}</span>
          <span className="mt-2 block text-lg font-black leading-tight text-primary-foreground drop-shadow">{title}</span>
        </div>
      </button>
      <dialog ref={dialogRef} onClose={() => setOpen(false)} onClick={(event) => { if (event.target === event.currentTarget) setOpen(false); }} aria-label={`Ilustración ampliada: ${title}`} className="m-auto w-[min(92vw,900px)] max-w-none overflow-visible rounded-lg bg-card p-3 shadow-panel backdrop:bg-canaan-texto/80">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="min-w-0 font-bold text-foreground [overflow-wrap:anywhere]">{title}</p>
          <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar ilustración" className="flex size-10 shrink-0 items-center justify-center rounded-md text-foreground hover:bg-muted">
            <X className="size-5" aria-hidden />
          </button>
        </div>
        <div role="img" aria-label={label} className="relative aspect-video w-full overflow-hidden rounded-md bg-canaan-celeste-suave">
          <PostScene variant={variant} />
        </div>
      </dialog>
    </>
  );
}

function PostScene({ variant }: { variant: string }) {
  if (variant === 'colors') {
    return <ColorsScene />;
  }

  if (variant === 'science') {
    return <ScienceScene />;
  }

  return <ReportsScene />;
}

function imageLabel(variant: string) {
  if (variant === 'colors') {
    return 'Actividad institucional';
  }

  if (variant === 'science') {
    return 'Ciencias naturales';
  }

  return 'Boletines digitales';
}

function ColorsScene() {
  const lanes = ['bg-primary', 'bg-canaan-celeste', 'bg-canaan-celeste-claro', 'bg-canaan-alerta'];
  const flags = ['bg-primary', 'bg-canaan-celeste', 'bg-canaan-celeste-claro', 'bg-canaan-alerta'];

  return (
    <>
      <div className="absolute inset-0 bg-canaan-alerta-suave" />
      <div className="absolute inset-x-0 top-0 h-[36%] bg-canaan-celeste-suave" />
      <div className="absolute left-5 top-5 grid w-40 grid-cols-4 gap-1.5 rounded-md border border-canaan-blanco/80 bg-canaan-blanco/82 p-2 shadow-soft sm:left-8 sm:top-7 sm:w-56 sm:gap-2 sm:p-3">
        {flags.map((flag, index) => (
          <span key={`${flag}-${index}`} className={cn('h-12 rounded-sm shadow-soft sm:h-16', flag)} />
        ))}
      </div>
      <div className="absolute right-5 top-6 h-24 w-28 rounded-md border border-canaan-borde bg-canaan-blanco/85 p-3 shadow-soft sm:right-12 sm:top-9 sm:h-32 sm:w-40">
        <div className="h-3 w-20 rounded-full bg-primary/80" />
        <div className="mt-3 space-y-2">
          <div className="h-2 rounded-full bg-canaan-alerta/70" />
          <div className="h-2 rounded-full bg-canaan-celeste-claro" />
          <div className="h-2 rounded-full bg-canaan-celeste/55" />
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-[43%] bg-canaan-celeste-suave">
        <div className="grid h-full grid-rows-4">
          {lanes.map((lane) => (
            <div key={lane} className={cn('border-t border-canaan-blanco/65', lane)} />
          ))}
        </div>
      </div>
      <div className="absolute bottom-[30%] left-[12%] flex items-end gap-4 sm:left-[22%]">
        {[18, 24, 20].map((size, index) => (
          <span key={size} className="flex flex-col items-center gap-1">
            <span className="size-5 rounded-full bg-canaan-texto shadow-soft" />
            <span className={cn('rounded-full shadow-soft', index === 1 ? 'bg-canaan-alerta/75' : 'bg-canaan-blanco')} style={{ width: size, height: size + 14 }} />
          </span>
        ))}
      </div>
    </>
  );
}

function ScienceScene() {
  return (
    <>
      <div className="absolute inset-0 bg-canaan-celeste-suave" />
      <div className="absolute left-5 top-5 h-28 w-36 rounded-md border border-canaan-borde bg-canaan-blanco/90 p-3 shadow-soft sm:left-8 sm:top-7 sm:h-36 sm:w-52">
        <div className="h-3 w-24 rounded-full bg-primary/80" />
        <div className="mt-4 flex items-end gap-2">
          <span className="h-14 w-8 rounded-b-full rounded-t-sm bg-canaan-celeste/35" />
          <span className="h-20 w-8 rounded-b-full rounded-t-sm bg-canaan-celeste-claro/55" />
          <span className="h-10 w-8 rounded-b-full rounded-t-sm bg-canaan-alerta/35" />
        </div>
      </div>
      <div className="absolute right-6 top-8 flex h-24 w-24 items-center justify-center rounded-full border border-canaan-borde bg-canaan-blanco/85 shadow-soft sm:right-16 sm:top-10 sm:size-36">
        <div className="size-14 rounded-full border-[10px] border-canaan-celeste bg-canaan-celeste-suave sm:size-20" />
      </div>
      <div className="absolute inset-x-0 bottom-0 h-[36%] bg-canaan-celeste-claro/25" />
      <div className="absolute bottom-[22%] left-[34%] h-20 w-28 rounded-md border border-canaan-borde bg-canaan-blanco/85 shadow-soft sm:h-24 sm:w-40">
        <div className="mx-auto mt-4 h-2 w-20 rounded-full bg-canaan-borde" />
        <div className="mx-auto mt-3 grid w-20 grid-cols-3 gap-1">
          <span className="h-8 rounded-sm bg-primary" />
          <span className="h-8 rounded-sm bg-canaan-celeste" />
          <span className="h-8 rounded-sm bg-canaan-alerta/75" />
        </div>
      </div>
    </>
  );
}

function ReportsScene() {
  return (
    <>
      <div className="absolute inset-0 bg-canaan-celeste-suave" />
      <div className="absolute left-5 top-5 h-32 w-40 rounded-md border border-canaan-borde bg-canaan-blanco/92 p-3 shadow-soft sm:left-10 sm:top-8 sm:h-40 sm:w-56">
        <div className="h-3 w-28 rounded-full bg-primary/80" />
        <div className="mt-4 space-y-2">
          <div className="h-2 rounded-full bg-canaan-borde" />
          <div className="h-2 w-4/5 rounded-full bg-canaan-borde" />
          <div className="h-2 w-2/3 rounded-full bg-canaan-borde" />
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2">
          <span className="h-10 rounded-sm bg-primary/25" />
          <span className="h-10 rounded-sm bg-canaan-alerta/35" />
          <span className="h-10 rounded-sm bg-canaan-celeste/35" />
        </div>
      </div>
      <div className="absolute right-7 top-8 h-28 w-32 rotate-3 rounded-md border border-canaan-alerta/25 bg-canaan-alerta-suave p-3 shadow-soft sm:right-20 sm:top-12 sm:h-36 sm:w-44">
        <div className="h-3 w-20 rounded-full bg-canaan-alerta" />
        <div className="mt-4 h-16 rounded-md bg-canaan-blanco/80" />
      </div>
      <div className="absolute inset-x-0 bottom-0 h-[34%] bg-canaan-celeste-claro/25" />
    </>
  );
}
