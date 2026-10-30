import {
  CalendarDays,
  ClipboardList,
  FileImage,
  FileText,
  GraduationCap,
  HeartHandshake,
  Home,
  Megaphone,
  School,
  ShieldCheck,
  UserCheck,
  UserRound,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type RolActivo = 'direccion' | 'docente' | 'alumno' | 'encargado';

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const roleHome: Record<RolActivo, string> = {
  direccion: '/admin',
  docente: '/profesor',
  alumno: '/alumno/muro',
  encargado: '/padre',
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
    name: 'Ana López · 3.º grado',
    description: 'Vista de alumno: agenda, notas y perfil.',
    Icon: UserRound,
    navActiveStyle:      'bg-accent text-primary',
    mobileActiveStyle:   'bg-accent text-primary',
    selectorActiveStyle: 'border-primary/40 bg-primary/10 text-primary',
  },
  encargado: {
    label: 'Padre/Encargado',
    badge: 'Padre/Encargado',
    name: 'Cuenta familiar',
    description: 'Consulta únicamente a sus alumnos vinculados.',
    Icon: HeartHandshake,
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
    { href: '/admin/calendario', label: 'Calendario',  icon: CalendarDays },
    { href: '/admin/avisos',   label: 'Comunicados',  icon: Megaphone    },
    { href: '/admin/reportes', label: 'Reportes',     icon: FileText     },
    { href: '/admin/vinculaciones', label: 'Vinculaciones', icon: HeartHandshake },
  ],
  docente: [
    { href: '/profesor',              label: 'Inicio',         icon: Home         },
    { href: '/profesor/mis-grados',   label: 'Mis grados',     icon: School       },
    { href: '/profesor/calificaciones', label: 'Académico', icon: ClipboardList },
    { href: '/profesor/calendario',   label: 'Calendario',     icon: CalendarDays },
    { href: '/profesor/asistencia',   label: 'Asistencia',     icon: UserCheck    },
    { href: '/profesor/galeria',      label: 'Entregables',    icon: FileImage    },
    { href: '/profesor/perfil',       label: 'Mi Perfil',      icon: UserRound    },
  ],
  alumno: [
    { href: '/alumno/muro',                       label: 'Muro',        icon: Home         },
    { href: '/alumno/calendario',                 label: 'Calendario',  icon: CalendarDays },
    { href: '/alumno/alumno-1/calificaciones',    label: 'Académico',   icon: FileText     },
    { href: '/alumno/alumno-1/galeria',           label: 'Entregables', icon: FileImage    },
    { href: '/alumno/alumno-1/perfil',            label: 'Mi Perfil',   icon: UserRound    },
  ],
  encargado: [
    { href: '/padre',            label: 'Muro',        icon: Home          },
    { href: '/padre/calendario', label: 'Calendario',  icon: CalendarDays  },
    { href: '/padre/academico',  label: 'Académico',   icon: FileText      },
    { href: '/padre/agenda',     label: 'Entregables', icon: FileImage     },
    { href: '/padre/perfil',     label: 'Mi Perfil',   icon: UserRound     },
    { href: '/padre/pagos',      label: 'Pagos',       icon: ClipboardList },
    { href: '/padre/documentos', label: 'Documentos',  icon: FileText      },
  ],
};

// Prefijos de ruta permitidos por rol (URL guard en modo demo)
export const allowedPaths: Record<RolActivo, string[]> = {
  direccion: ['/admin', '/aviso', '/dashboard'],
  docente:   ['/profesor', '/aviso', '/dashboard'],
  alumno:    ['/alumno', '/aviso', '/dashboard'],
  encargado: ['/padre', '/aviso', '/dashboard'],
};
