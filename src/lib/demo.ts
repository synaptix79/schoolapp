import type { Role, Profile } from '@/lib/auth';

export const demoToday = '2026-06-27';
const demoSchoolId = '00000000-0000-4000-8000-000000000001';

export const demoProfiles: Record<Role, Profile> = {
  admin: {
    id: 'demo-admin',
    rol: 'admin',
    nombre_completo: 'Dirección Canaán',
    telefono: '+595 981 000 001',
    avatar_url: null,
    activo: true,
    school_id: demoSchoolId
  },
  profesor: {
    id: 'demo-profesor',
    rol: 'profesor',
    nombre_completo: 'Prof. Marta Benítez',
    telefono: '+595 981 000 002',
    avatar_url: null,
    activo: true,
    school_id: demoSchoolId
  },
  padre_encargado: {
    id: 'demo-padre-encargado',
    rol: 'padre_encargado',
    nombre_completo: 'Juan López',
    telefono: '+595 981 000 003',
    avatar_url: null,
    activo: true,
    school_id: demoSchoolId
  },
  padre: {
    id: 'demo-padre',
    rol: 'padre',
    nombre_completo: 'Juan López',
    telefono: '+595 981 000 003',
    avatar_url: null,
    activo: true,
    school_id: demoSchoolId
  }
};

export const demoUsers = [
  { id: 'demo-admin', nombre: 'Dirección Canaán', rol: 'admin', email: 'direccion@canaan.edu.py', estado: 'activo' },
  { id: 'demo-profesor', nombre: 'Prof. Marta Benítez', rol: 'profesor', email: 'marta@canaan.edu.py', estado: 'activo' },
  { id: 'demo-profesor-2', nombre: 'Prof. Diego Fernández', rol: 'profesor', email: 'diego@canaan.edu.py', estado: 'activo' },
  { id: 'demo-padre', nombre: 'Juan López', rol: 'padre', email: 'juan.lopez@email.com', estado: 'activo' },
  { id: 'demo-madre', nombre: 'María Duarte', rol: 'padre', email: 'maria.duarte@email.com', estado: 'pendiente' }
];

export const demoChildren = [
  {
    id: 'alumno-1',
    nombre: 'Ana López',
    fechaNacimiento: '2016-04-12',
    grado: '3.º EEB',
    seccion: 'A',
    anioLectivo: 2026,
    estado: 'activo',
    promedio: '4.7',
    asistencia: '96%',
    tutor: 'Juan López',
    consentimientoFotos: true,
    proximo: 'Tarea de Ciencias para el lunes',
    // Perfil extendido (Bloque 3)
    ci: '1.234.567',
    tipoSangre: 'A+',
    contactoEmergencia: 'María López · +595 981 111 222',
    observacionesMedicas: 'Sin alergias conocidas. Usa lente correctivo en ojo derecho.'
  },
  {
    id: 'alumno-2',
    nombre: 'Mateo López',
    fechaNacimiento: '2018-09-08',
    grado: '1.º EEB',
    seccion: 'B',
    anioLectivo: 2026,
    estado: 'activo',
    promedio: '4.5',
    asistencia: '94%',
    tutor: 'Juan López',
    consentimientoFotos: true,
    proximo: 'Lectura guiada el martes',
    ci: '2.345.678',
    tipoSangre: 'O+',
    contactoEmergencia: 'Juan López · +595 981 000 003',
    observacionesMedicas: 'Alérgico a la penicilina.'
  },
  {
    id: 'alumno-3',
    nombre: 'Sofía Duarte',
    fechaNacimiento: '2015-02-20',
    grado: '4.º EEB',
    seccion: 'A',
    anioLectivo: 2026,
    estado: 'activo',
    promedio: '4.2',
    asistencia: '91%',
    tutor: 'María Duarte',
    consentimientoFotos: false,
    proximo: 'Traer autorización firmada',
    ci: '3.456.789',
    tipoSangre: 'B+',
    contactoEmergencia: 'María Duarte · +595 981 000 004',
    observacionesMedicas: 'Sin observaciones médicas registradas.'
  }
];

export const demoGrades = [
  { grado: 'Inicial 5', seccion: 'A', anioLectivo: 2026, profesor: 'Prof. Laura Rojas', alumnos: 24 },
  { grado: '1.º EEB', seccion: 'B', anioLectivo: 2026, profesor: 'Prof. Marta Benítez', alumnos: 28 },
  { grado: '3.º EEB', seccion: 'A', anioLectivo: 2026, profesor: 'Prof. Marta Benítez', alumnos: 31 },
  { grado: '4.º EEB', seccion: 'A', anioLectivo: 2026, profesor: 'Prof. Diego Fernández', alumnos: 29 },
  { grado: '1.º Nivel Medio', seccion: 'C', anioLectivo: 2026, profesor: 'Prof. Alicia Gómez', alumnos: 26 }
];

export const demoSubjects = [
  { nombre: 'Comunicación', nivel: 'EEB', profesor: 'Prof. Marta Benítez', estado: 'activa' },
  { nombre: 'Matemática', nivel: 'EEB', profesor: 'Prof. Diego Fernández', estado: 'activa' },
  { nombre: 'Ciencias Naturales', nivel: 'EEB', profesor: 'Prof. Marta Benítez', estado: 'activa' },
  { nombre: 'Formación Cristiana', nivel: 'Institucional', profesor: 'Equipo pastoral', estado: 'activa' }
];

export const demoStats = [
  { label: 'Alumnos activos', value: '428', detail: '+18 este año' },
  { label: 'Calificaciones cargadas', value: '87%', detail: 'Primer trimestre' },
  { label: 'Profesores con pendientes', value: '4', detail: 'Revisión semanal' }
];

export const demoCommuniques = [
  {
    id: 'olimpiada-colores',
    title: 'Olimpiada de Colores',
    body: 'Una mañana para celebrar, compartir y alentar a nuestros equipos. La comunidad educativa puede acompañar desde las 08:00. ¡Traé tu color con alegría!',
    category: 'evento',
    scope: 'global',
    grades: [] as string[],
    pinned: true,
    date: '26 de junio, 2026',
    relativeTime: 'Hace 2 horas',
    exactTime: '26 jun · 10:40',
    author: 'Dirección CECC',
    authorInitials: 'DC',
    reactions: 126,
    image: 'colors'
  },
  {
    id: 'reunion-3-4-eeb',
    title: 'Reunión de seguimiento de 3.º y 4.º EEB',
    body: 'Nos encontramos el viernes a las 18:30 en el salón auditorio para revisar avances académicos y acuerdos del trimestre.',
    category: 'aviso',
    scope: 'grado',
    grades: ['3.º EEB', '4.º EEB'],
    pinned: true,
    date: '25 de junio, 2026',
    relativeTime: 'Ayer · 16:40',
    exactTime: '25 jun · 16:40',
    author: 'Dirección CECC',
    authorInitials: 'DC',
    reactions: 48,
    image: null
  },
  {
    id: 'entrega-boletines',
    title: 'Entrega de boletines',
    body: 'Los informes del primer trimestre estarán disponibles desde el martes. Cada alumno verá únicamente su información académica autorizada.',
    category: 'noticia',
    scope: 'global',
    grades: [] as string[],
    pinned: false,
    date: '24 de junio, 2026',
    relativeTime: 'Hace 2 días',
    exactTime: '24 jun · 09:15',
    author: 'Secretaría académica',
    authorInitials: 'SA',
    reactions: 89,
    image: 'reports'
  },
  {
    id: 'tarea-ciencias-3eeb',
    title: '3.º EEB: tarea de Ciencias',
    body: 'Traer una hoja con observaciones de una planta del hogar. La actividad será compartida en clase el lunes.',
    category: 'aviso',
    scope: 'grado',
    grades: ['3.º EEB'],
    pinned: false,
    date: '23 de junio, 2026',
    relativeTime: 'Hace 3 días',
    exactTime: '23 jun · 14:10',
    author: 'Prof. Marta Benítez',
    authorInitials: 'MB',
    reactions: 32,
    image: 'science'
  }
];

export const demoCalificaciones = [
  { alumnoId: 'alumno-1', alumno: 'Ana López', grado: '3.º EEB', materia: 'Comunicación', periodo: '1er trimestre', nota: '4.8', observacion: 'Excelente comprensión lectora.' },
  { alumnoId: 'alumno-1', alumno: 'Ana López', grado: '3.º EEB', materia: 'Matemática', periodo: '1er trimestre', nota: '4.6', observacion: 'Buen avance en resolución de problemas.' },
  { alumnoId: 'alumno-1', alumno: 'Ana López', grado: '3.º EEB', materia: 'Ciencias Naturales', periodo: '1er trimestre', nota: '4.7', observacion: 'Participa con seguridad.' },
  { alumnoId: 'alumno-2', alumno: 'Mateo López', grado: '1.º EEB', materia: 'Comunicación', periodo: '1er trimestre', nota: '4.4', observacion: 'Necesita reforzar lectura diaria.' },
  { alumnoId: 'alumno-2', alumno: 'Mateo López', grado: '1.º EEB', materia: 'Matemática', periodo: '1er trimestre', nota: '4.6', observacion: 'Muy buen trabajo con números.' },
  { alumnoId: 'alumno-3', alumno: 'Sofía Duarte', grado: '4.º EEB', materia: 'Formación Cristiana', periodo: '1er trimestre', nota: '4.2', observacion: 'Responsable y colaborativa.' }
];

export const demoGallery = [
  { id: 'foto-1', alumnoId: 'alumno-1', alumno: 'Ana López', grado: '3.º EEB', descripcion: 'Lectura compartida en aula', visible: true, consentimiento: true, tipo: 'individual' },
  { id: 'foto-2', alumnoId: 'alumno-2', alumno: 'Mateo López', grado: '1.º EEB', descripcion: 'Actividad de motricidad fina', visible: true, consentimiento: true, tipo: 'individual' },
  { id: 'foto-3', alumnoId: 'alumno-3', alumno: 'Sofía Duarte', grado: '4.º EEB', descripcion: 'Foto grupal pendiente de autorización', visible: true, consentimiento: false, tipo: 'grupal' },
  { id: 'foto-4', alumnoId: null, alumno: '3.º EEB A', grado: '3.º EEB', descripcion: 'Olimpiada de Colores - grupo azul', visible: true, consentimiento: true, tipo: 'grupal' }
];

export const demoEvents = [
  { id: 'evento-2', titulo: 'Reunión 3.º EEB', descripcion: 'Seguimiento académico del trimestre.', fecha: '2026-07-03', hora: '18:30', alcance: 'grado', grado: '3.º EEB' },
  { id: 'evento-3', titulo: 'Entrega de boletines', descripcion: 'Publicación por alumno en el portal.', fecha: '2026-07-07', hora: '08:00', alcance: 'global', grado: null }
];

export const demoAdminReports = [
  { grado: '1.º EEB B', carga: '90%', pendientes: 2, profesor: 'Prof. Marta Benítez' },
  { grado: '3.º EEB A', carga: '82%', pendientes: 5, profesor: 'Prof. Marta Benítez' },
  { grado: '4.º EEB A', carga: '76%', pendientes: 8, profesor: 'Prof. Diego Fernández' }
];

// ── Perfil docente (Bloque 3) ──────────────────────────────────────────────

export const demoDocentePerfil = {
  id: 'demo-profesor',
  nombre: 'Prof. Marta Benítez',
  ci: '4.567.890',
  telefono: '+595 981 000 002',
  email: 'marta@canaan.edu.py',
  materias: ['Comunicación', 'Ciencias Naturales'],
  grados: ['1.º EEB B', '3.º EEB A'],
};

// ── Tareas y entregas (Bloque 1) ───────────────────────────────────────────

export type Tarea = {
  id: string;
  grado: string;
  materia: string;
  profesorId: string;
  profesor: string;
  titulo: string;
  consigna: string;
  archivoUrl: string | null;
  modalidad: 'terminado_en_clase' | 'tarea';
  asignadaAt: string; // YYYY-MM-DD
  venceAt: string | null; // YYYY-MM-DD
  createdAt: string;  // ISO
};

export type Entrega = {
  id: string;
  tareaId: string;
  alumnoId: string;
  estado: 'pendiente' | 'entregado_en_revision' | 'entregado_corregido';
  archivoEntregaUrl: string | null;
  puntos: number | null;
  notaCorreccion: string | null;
  entregadoAt: string | null;
  corregidoAt: string | null;
};

export const demoTareas: Tarea[] = [
  {
    id: 'tarea-1',
    grado: '3.º EEB',
    materia: 'Matemática',
    profesorId: 'demo-profesor-2',
    profesor: 'Prof. Diego Fernández',
    titulo: 'Práctica de fracciones',
    consigna: 'Resolver los ejercicios 12 al 20 del cuaderno. Mostrar el procedimiento completo en cada ítem.',
    archivoUrl: 'tareas/3eeb/fracciones-guia.pdf',
    modalidad: 'terminado_en_clase',
    asignadaAt: '2026-06-24',
    venceAt: null,
    createdAt: '2026-06-24T10:00:00-04:00',
  },
  {
    id: 'tarea-2',
    grado: '3.º EEB',
    materia: 'Ciencias Naturales',
    profesorId: 'demo-profesor',
    profesor: 'Prof. Marta Benítez',
    titulo: 'Observación de planta',
    consigna: 'Traer hoja escrita con observaciones de una planta del hogar. Incluir: nombre, tamaño estimado, descripción de hoja y flor si tiene.',
    archivoUrl: 'tareas/3eeb/observacion-planta.pdf',
    modalidad: 'tarea',
    asignadaAt: '2026-06-24',
    venceAt:    '2026-06-30',
    createdAt: '2026-06-24T11:20:00-04:00',
  },
  {
    id: 'tarea-3',
    grado: '3.º EEB',
    materia: 'Comunicación',
    profesorId: 'demo-profesor',
    profesor: 'Prof. Marta Benítez',
    titulo: 'Reseña de cuento favorito',
    consigna: 'Elegir un cuento favorito y escribir una reseña breve de al menos 5 oraciones: personajes, trama y tu opinión personal.',
    archivoUrl: null,
    modalidad: 'tarea',
    asignadaAt: '2026-06-23',
    venceAt:    '2026-06-27',
    createdAt: '2026-06-23T09:00:00-04:00',
  },
  {
    id: 'tarea-4',
    grado: '3.º EEB',
    materia: 'Matemática',
    profesorId: 'demo-profesor-2',
    profesor: 'Prof. Diego Fernández',
    titulo: 'Guía de problemas combinados',
    consigna: 'Resolver la guía de problemas combinados. Subir foto clara de la hoja completa.',
    archivoUrl: 'tareas/3eeb/problemas-combinados.pdf',
    modalidad: 'tarea',
    asignadaAt: '2026-06-21',
    venceAt:    '2026-06-26',
    createdAt: '2026-06-21T08:40:00-04:00',
  },
  {
    id: 'tarea-5',
    grado: '3.º EEB',
    materia: 'Comunicación',
    profesorId: 'demo-profesor',
    profesor: 'Prof. Marta Benítez',
    titulo: 'Guía de lectura semanal',
    consigna: 'Completar la guía de lectura y subir una foto de la hoja antes del cierre.',
    archivoUrl: 'tareas/3eeb/guia-lectura-semanal.pdf',
    modalidad: 'tarea',
    asignadaAt: '2026-06-27',
    venceAt:    '2026-06-30',
    createdAt: '2026-06-27T08:30:00-04:00',
  },
];

// Entregas de Ana López (alumno-1)
export const demoEntregas: Entrega[] = [
  {
    id: 'entrega-2',
    tareaId: 'tarea-2',
    alumnoId: 'alumno-1',
    estado: 'entregado_en_revision',
    archivoEntregaUrl: 'tareas/entregas/alumno-1/observacion-planta.jpg',
    puntos: null,
    notaCorreccion: null,
    entregadoAt: '2026-06-26',
    corregidoAt: null,
  },
  {
    id: 'entrega-3',
    tareaId: 'tarea-3',
    alumnoId: 'alumno-1',
    estado: 'entregado_corregido',
    archivoEntregaUrl: 'tareas/entregas/alumno-1/resena-cuento.jpg',
    puntos: 9,
    notaCorreccion: 'Muy buena reseña. Las ideas están bien organizadas. Trabajar un poco más en la descripción del personaje principal.',
    entregadoAt: '2026-06-24',
    corregidoAt: '2026-06-25',
  },
];

// ── Académico / Calendario ─────────────────────────────────────────────────

export type NotaDiaria = {
  id: string;
  grado: string;
  materia: string;
  profesor: string;
  profesorInicial: string;
  texto: string;
  tipo: 'info' | 'felicitacion' | 'observacion';
  fecha: string; // YYYY-MM-DD
};

export type BoletinSemanal = {
  id: string;
  semanaInicio: string;
  semanaFin: string;
  titulo: string;
  resumen: string;
  hitos: string[];
  autor: string;
  esActual: boolean;
};

export type Actividad = {
  id: string;
  tipo: 'tarea' | 'examen' | 'evento' | 'reunion';
  titulo: string;
  descripcion: string;
  materia: string | null;
  grado: string | null;
  fecha: string; // YYYY-MM-DD
  hora: string | null;
};

export type ConfigCalendario = {
  id: string;
  grado: string | null;
  alcance: 'semana' | 'mes';
  desde: string;
  hasta: string;
  mostrarFinesSemana: boolean;
  activadoPor: string;
};

export const demoNotasDiarias: NotaDiaria[] = [
  {
    id: 'nota-1',
    grado: '3.º EEB',
    materia: 'Comunicación',
    profesor: 'Prof. Marta Benítez',
    profesorInicial: 'MB',
    texto: 'Avanzamos hasta la página 42 del libro de lectura. Para la próxima clase: repasar los adjetivos calificativos de las páginas 38–40.',
    tipo: 'info',
    fecha: '2026-06-26'
  },
  {
    id: 'nota-2',
    grado: '3.º EEB',
    materia: 'Matemática',
    profesor: 'Prof. Diego Fernández',
    profesorInicial: 'DF',
    texto: '¡Excelente trabajo con las fracciones equivalentes! La mayoría del grupo superó la autoevaluación con nota superior a 4. Seguimos el viernes con geometría básica.',
    tipo: 'felicitacion',
    fecha: '2026-06-25'
  },
  {
    id: 'nota-3',
    grado: '3.º EEB',
    materia: 'Ciencias Naturales',
    profesor: 'Prof. Marta Benítez',
    profesorInicial: 'MB',
    texto: 'Recordar traer la hoja de observaciones de la planta del hogar para el lunes. Incluir: nombre de la planta, tamaño estimado, descripción de hoja y flor si tiene.',
    tipo: 'observacion',
    fecha: '2026-06-24'
  },
  {
    id: 'nota-4',
    grado: '3.º EEB',
    materia: 'Comunicación',
    profesor: 'Prof. Marta Benítez',
    profesorInicial: 'MB',
    texto: 'Revisamos el cuento "El zorro y el cuervo". Buena participación en la lectura en voz alta. Para el viernes: elegir un cuento favorito y preparar una reseña breve.',
    tipo: 'info',
    fecha: '2026-06-23'
  },
  {
    id: 'nota-5',
    grado: '3.º EEB',
    materia: 'Matemática',
    profesor: 'Prof. Diego Fernández',
    profesorInicial: 'DF',
    texto: 'Se observa dificultad en identificar numerador y denominador en fracciones compuestas. Recomendamos práctica diaria en casa con el cuaderno de ejercicios, páginas 55–57.',
    tipo: 'observacion',
    fecha: '2026-06-20'
  },
  {
    id: 'nota-6',
    grado: '3.º EEB',
    materia: 'Ciencias Naturales',
    profesor: 'Prof. Marta Benítez',
    profesorInicial: 'MB',
    texto: 'Comenzamos el proyecto de observación de plantas. Todos los alumnos eligieron su planta. Buen inicio de la actividad grupal.',
    tipo: 'info',
    fecha: '2026-06-19'
  }
];

export const demoBoletinSemanal: BoletinSemanal[] = [
  {
    id: 'boletin-1',
    semanaInicio: '2026-06-23',
    semanaFin: '2026-06-28',
    titulo: 'Semana 23–28 de junio',
    resumen: 'Cerramos el primer trimestre con la Olimpiada de Colores. La asistencia promedio fue del 94 %. Destacamos el avance en Matemática con la autoevaluación de fracciones y la participación en lectura compartida en Comunicación.',
    hitos: [
      'Olimpiada de Colores: jueves 26 (08:00 hs, toda la comunidad)',
      'Boletines disponibles desde el martes 1 de julio',
      'Examen de Matemática: jueves 2 de julio'
    ],
    autor: 'Dirección CECC',
    esActual: true
  },
  {
    id: 'boletin-2',
    semanaInicio: '2026-06-16',
    semanaFin: '2026-06-21',
    titulo: 'Semana 16–21 de junio',
    resumen: 'Semana de evaluaciones formativas en Comunicación y Matemática. 3.º EEB inició el proyecto de Ciencias Naturales. Se realizó la capacitación docente del miércoles.',
    hitos: [
      'Evaluación Comunicación: martes 17',
      'Capacitación docente: miércoles 18',
      'Inicio proyecto Ciencias: jueves 19'
    ],
    autor: 'Dirección CECC',
    esActual: false
  },
  {
    id: 'boletin-3',
    semanaInicio: '2026-06-09',
    semanaFin: '2026-06-14',
    titulo: 'Semana 9–14 de junio',
    resumen: 'Inicio de la segunda parte del primer trimestre. Los docentes presentaron las planificaciones de cierre. Se avanzó en fracciones (Matemática) y narración (Comunicación).',
    hitos: [
      'Entrega planificaciones docentes: lunes 9',
      'Taller de padres: viernes 13'
    ],
    autor: 'Dirección CECC',
    esActual: false
  }
];

export const demoActividades: Actividad[] = [
  // Junio 2026
  { id: 'activ-1', tipo: 'tarea',   titulo: 'Práctica de fracciones',        descripcion: 'Resolver ejercicios 12–20 del cuaderno de Matemática.',                                    materia: 'Matemática',       grado: '3.º EEB', fecha: '2026-06-24', hora: null    },
  { id: 'activ-2', tipo: 'evento',  titulo: 'Olimpiada de Colores',           descripcion: 'Celebración institucional. Toda la comunidad invitada. Traé tu color con alegría.',          materia: null,               grado: null,       fecha: '2026-06-26', hora: '08:00' },
  { id: 'activ-4', tipo: 'tarea',   titulo: 'Observación de planta',          descripcion: 'Traer hoja escrita con observaciones de una planta del hogar (nombre, tamaño, hoja, flor).', materia: 'Ciencias Naturales', grado: '3.º EEB', fecha: '2026-06-30', hora: null    },
  // Julio 2026
  { id: 'activ-5', tipo: 'evento',  titulo: 'Entrega de boletines',           descripcion: 'Los informes del 1er trimestre estarán disponibles desde esta fecha en el portal.',          materia: null,               grado: null,       fecha: '2026-07-01', hora: '08:00' },
  { id: 'activ-6', tipo: 'examen',  titulo: 'Examen de Matemática',           descripcion: 'Capítulos 4–6: fracciones, geometría básica y numeración hasta 10.000.',                    materia: 'Matemática',       grado: '3.º EEB', fecha: '2026-07-02', hora: '08:00' },
  { id: 'activ-7', tipo: 'reunion', titulo: 'Reunión de seguimiento 3.º EEB', descripcion: 'Revisión de avances del trimestre y acuerdos para el segundo período. Asistencia solicitada.', materia: null,             grado: '3.º EEB', fecha: '2026-07-03', hora: '18:30' },
  { id: 'activ-8', tipo: 'examen',  titulo: 'Examen de Comunicación',         descripcion: 'Cuento narrativo, análisis de texto y comprensión lectora.',                                materia: 'Comunicación',     grado: '3.º EEB', fecha: '2026-07-07', hora: '09:00' },
  { id: 'activ-9', tipo: 'tarea',   titulo: 'Redacción: mi planta favorita',  descripcion: 'Escribir un párrafo de 5 oraciones describiendo la planta observada.',                       materia: 'Ciencias Naturales', grado: '3.º EEB', fecha: '2026-07-08', hora: null    },
  { id: 'activ-10', tipo: 'evento', titulo: 'Día del maestro',                descripcion: 'Acto de reconocimiento. Día no lectivo para alumnos.',                                       materia: null,               grado: null,       fecha: '2026-07-10', hora: null    },
  { id: 'activ-11', tipo: 'examen', titulo: 'Evaluación Formación Cristiana', descripcion: 'Tema: valores y convivencia. Modalidad oral y escrita.',                                     materia: 'Formación Cristiana', grado: '3.º EEB', fecha: '2026-07-14', hora: '10:00' },
  { id: 'activ-12', tipo: 'reunion', titulo: 'Reunión general de padres',     descripcion: 'Presentación del segundo trimestre y novedades institucionales.',                             materia: null,               grado: null,       fecha: '2026-07-15', hora: '18:00' }
];

export const demoConfigCalendario: ConfigCalendario[] = [];

// ── Docente: anotaciones y alumnos por grado (Fase 4) ──────────────────────

export type AnotacionDocente = {
  id: string;
  grado: string;
  alumnoId: string | null;
  alumnoNombre: string | null;
  materia: string;
  profesor: string;
  texto: string;
  tipo: 'info' | 'felicitacion' | 'observacion';
  estado: 'borrador' | 'completada';
  fecha: string;
};

export const demoAlumnosPorGrado: Record<string, Array<{ id: string; nombre: string }>> = {
  '3.º EEB A': [
    { id: 'alumno-1', nombre: 'Ana López'       },
    { id: 'ea-2',     nombre: 'Pedro Rodas'      },
    { id: 'ea-3',     nombre: 'Sofía Martínez'   },
    { id: 'ea-4',     nombre: 'Diego Cáceres'    },
    { id: 'ea-5',     nombre: 'Valentina Ruiz'   },
  ],
  '1.º EEB B': [
    { id: 'alumno-2', nombre: 'Mateo López'      },
    { id: 'eb-2',     nombre: 'Camila Giménez'   },
    { id: 'eb-3',     nombre: 'Lucas Torres'     },
    { id: 'eb-4',     nombre: 'Isabella Pereira' },
  ],
};

export const demoAnotaciones: AnotacionDocente[] = [
  {
    id: 'anot-1',
    grado: '3.º EEB A',
    alumnoId: null,
    alumnoNombre: null,
    materia: 'Comunicación',
    profesor: 'Prof. Marta Benítez',
    texto: 'Avanzamos hasta la página 42 del libro. Para el lunes: repasar adjetivos calificativos, páginas 38–40.',
    tipo: 'info',
    estado: 'completada',
    fecha: '2026-06-26',
  },
  {
    id: 'anot-2',
    grado: '3.º EEB A',
    alumnoId: 'alumno-1',
    alumnoNombre: 'Ana López',
    materia: 'Matemática',
    profesor: 'Prof. Marta Benítez',
    texto: 'Excelente trabajo con fracciones equivalentes. Superó la autoevaluación con nota 4.8.',
    tipo: 'felicitacion',
    estado: 'completada',
    fecha: '2026-06-26',
  },
  {
    id: 'anot-3',
    grado: '3.º EEB A',
    alumnoId: null,
    alumnoNombre: null,
    materia: 'Ciencias Naturales',
    profesor: 'Prof. Marta Benítez',
    texto: 'Recordar traer la hoja de observaciones de planta del hogar para el lunes.',
    tipo: 'observacion',
    estado: 'borrador',
    fecha: '2026-06-26',
  },
  {
    id: 'anot-4',
    grado: '1.º EEB B',
    alumnoId: null,
    alumnoNombre: null,
    materia: 'Comunicación',
    profesor: 'Prof. Marta Benítez',
    texto: 'Lectura guiada completada. Todos participaron activamente en la puesta en común.',
    tipo: 'info',
    estado: 'borrador',
    fecha: '2026-06-26',
  },
  {
    id: 'anot-5',
    grado: '1.º EEB B',
    alumnoId: 'alumno-2',
    alumnoNombre: 'Mateo López',
    materia: 'Matemática',
    profesor: 'Prof. Marta Benítez',
    texto: 'Dificultad con la escritura de números del 50 al 100. Recomendamos práctica en casa con el cuaderno.',
    tipo: 'observacion',
    estado: 'completada',
    fecha: '2026-06-25',
  },
];
