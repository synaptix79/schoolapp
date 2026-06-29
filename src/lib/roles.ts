import {
  CalendarDays,
  ClipboardList,
  FileImage,
  FileText,
  GraduationCap,
  Home,
  Megaphone,
  School,
  ShieldCheck,
  UserRound,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type RolActivo = 'direccion' | 'docente' | 'alumno';

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const roleHome: Record<RolActivo, string> = {
  direccion: '/admin',
  docente: '/profesor',
  alumno: '/padre',
};

export const roleMeta: Record<
  RolActivo,
  {
    label: string;
    badge: string;
    name: string;
    description: string;
    Icon: LucideIcon;
    /** Pill class for the active item in the desktop sidebar */
    navActiveStyle: string;
    /** Pill class for the active item in the mobile bottom bar */
    mobileActiveStyle: string;
    /** Highlighted class for the active option in the role selector dropdown */
    selectorActiveStyle: string;
  }
> = {
  direccion: {
    label: 'Dirección',
    badge: 'Dirección',
    name: 'Dirección Canaán',
    description: 'Ve todo y gestiona publicaciones.',
    Icon: ShieldCheck,
    navActiveStyle:      'bg-accent text-primary',
    mobileActiveStyle:   'bg-accent text-primary',
    selectorActiveStyle: 'border-primary/40 bg-primary/10 text-primary',
  },
  docente: {
    label: 'Docente',
    badge: 'Docente',
    name: 'Prof. Marta Benítez',
    description: 'Ve global + grados asignados.',
    Icon: GraduationCap,
    navActiveStyle:      'bg-accent text-primary',
    mobileActiveStyle:   'bg-accent text-primary',
    selectorActiveStyle: 'border-primary/40 bg-primary/10 text-primary',
  },
  alumno: {
    label: 'Alumno',
    badge: 'Alumno',
    name: 'Ana López · 3.º EEB',
    description: 'Vista de alumno: agenda, notas y perfil.',
    Icon: UserRound,
    navActiveStyle:      'bg-accent text-primary',
    mobileActiveStyle:   'bg-accent text-primary',
    selectorActiveStyle: 'border-primary/40 bg-primary/10 text-primary',
  },
};

export const navItemsMap: Record<RolActivo, NavItem[]> = {
  direccion: [
    { href: '/admin',          label: 'Inicio',       icon: Home         },
    { href: '/admin/usuarios', label: 'Usuarios',     icon: Users        },
    { href: '/admin/alumnos',  label: 'Alumnos',      icon: GraduationCap},
    { href: '/admin/grados',   label: 'Grados',       icon: School       },
    { href: '/admin/avisos',   label: 'Comunicados',  icon: Megaphone    },
    { href: '/admin/reportes', label: 'Reportes',     icon: FileText     },
  ],
  docente: [
    { href: '/profesor',              label: 'Inicio',         icon: Home         },
    { href: '/profesor/mis-grados',   label: 'Mis grados',     icon: School       },
    { href: '/profesor/calificaciones', label: 'Académico', icon: ClipboardList },
    { href: '/profesor/asistencia',   label: 'Asistencia',     icon: CalendarDays },
    { href: '/profesor/galeria',      label: 'Entregables',    icon: FileImage    },
    { href: '/profesor/perfil',       label: 'Mi Perfil',      icon: UserRound    },
  ],
  alumno: [
    { href: '/padre',                       label: 'Muro',       icon: Home         },
    { href: '/padre/calendario',            label: 'Calendario', icon: CalendarDays },
    { href: '/padre/alumno-1/calificaciones', label: 'Académico', icon: FileText    },
    { href: '/padre/alumno-1/galeria',      label: 'Entregables', icon: FileImage   },
    { href: '/padre/alumno-1/perfil',       label: 'Mi Perfil',  icon: UserRound    },
  ],
};

// Prefijos de ruta permitidos por rol (URL guard en modo demo)
export const allowedPaths: Record<RolActivo, string[]> = {
  direccion: ['/admin', '/aviso', '/dashboard'],
  docente:   ['/profesor', '/aviso', '/dashboard'],
  alumno:    ['/padre', '/alumno', '/aviso', '/dashboard'],
};
