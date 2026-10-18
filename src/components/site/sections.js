// Mapa de secciones del sitio (ids de ancla acordados en docs/ARCHITECTURE.md).
export const SECTION_IDS = ['inicio', 'perfil', 'proyectos', 'stack', 'credenciales', 'cv', 'contacto', 'comentarios'];

/** Secciones con fondo claro: el índice lateral cambia de tinta sobre ellas. */
export const PAPER_IDS = ['perfil', 'credenciales'];

export const SECTION_LABELS = {
  inicio: 'Inicio',
  perfil: 'Perfil',
  proyectos: 'Proyectos',
  stack: 'Stack',
  credenciales: 'Credenciales',
  cv: 'CV',
  contacto: 'Contacto',
  comentarios: 'Comentarios',
};

// Enlaces del nav (máx. 6). Credenciales cuelga de Stack.
export const NAV_LINKS = ['perfil', 'proyectos', 'stack', 'cv', 'contacto', 'comentarios'];
export const NAV_GROUP = { credenciales: 'stack' };
export const SHEET_LINKS = ['perfil', 'proyectos', 'stack', 'credenciales', 'cv', 'contacto', 'comentarios'];
