export interface ForoAutor {
  id: string;
  carreraId: string | null;
  isAdmin: boolean;
}

/**
 * Espejo en TypeScript de la policy `foro_publicaciones_insert` (migración
 * 039) — la fuente de verdad sigue siendo la RLS, esto es solo para que la
 * UI pueda ocultar/deshabilitar el selector de carrera antes de pegarle a
 * la DB, no para reemplazar el chequeo real.
 */
export function puedePublicarEnCarrera(autor: ForoAutor, carreraId: string | null): boolean {
  if (carreraId === null) return true;
  return autor.isAdmin || autor.carreraId === carreraId;
}

export interface ForoPublicacion {
  autorId: string;
  oculto: boolean;
}

/**
 * Espejo de la policy `foro_publicaciones_select`: no ocultas para
 * cualquiera, ocultas solo para su autor o el Admin.
 */
export function puedeVerPublicacion(publicacion: ForoPublicacion, viewerId: string | null, isAdmin: boolean): boolean {
  if (!viewerId) return false;
  if (!publicacion.oculto) return true;
  return isAdmin || publicacion.autorId === viewerId;
}
