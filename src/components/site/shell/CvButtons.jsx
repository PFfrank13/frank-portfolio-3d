import { Download, ExternalLink, Loader2, RefreshCw } from 'lucide-react';

/** Botón «Descargar CV» con estados de carga y error con reintento. */
export function CvDownloadButton({ cv, className = '' }) {
  if (cv.error) {
    return (
      <span className={`inline-flex flex-wrap items-center gap-3 ${className}`} role="alert">
        <button type="button" className="btn" onClick={cv.retry}>
          <RefreshCw size={16} aria-hidden /> Reintentar
        </button>
        <span className="text-sm text-danger">No se pudo preparar el CV.</span>
      </span>
    );
  }
  return (
    <button type="button" className={`btn ${className}`} onClick={cv.download} disabled={!cv.ready} aria-busy={cv.loading}>
      {cv.loading ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <Download size={16} aria-hidden />}
      {cv.loading ? 'Preparando CV' : 'Descargar CV'}
    </button>
  );
}

export function CvOpenButton({ cv, className = '' }) {
  return (
    <button type="button" className={`btn ${className}`} onClick={cv.open} disabled={!cv.ready}>
      <ExternalLink size={16} aria-hidden /> Abrir en una pestaña
    </button>
  );
}
