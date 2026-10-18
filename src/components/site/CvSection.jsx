import cvPreview from '../../assets/cv-preview.png';
import SectionHead from './SectionHead.jsx';
import Reveal from './Reveal.jsx';
import { useCvDownload } from './useCv.js';
import { CvDownloadButton, CvOpenButton } from './shell/CvButtons.jsx';
import { formatDateTime } from '../../lib/format.js';

export default function CvSection() {
  const cv = useCvDownload();
  return (
    <section id="cv" aria-labelledby="cv-title" className="sb-sec">
      <div className="container py-24 lg:py-36">
        <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-20">
          <div className="lg:col-span-6">
            <SectionHead kicker="Currículum" id="cv-title">Mi CV, en una página</SectionHead>
            <Reveal>
              <p className="sb-lead mt-6">Experiencia, proyectos, formación y herramientas en un PDF listo para imprimir o reenviar.</p>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <CvDownloadButton cv={cv} className="btn-primary" />
                {!cv.error && <CvOpenButton cv={cv} />}
              </div>
              <p className="hint mt-4" style={{ color: 'var(--fg-3)' }}>
                {cv.name}{cv.updatedAt ? ` · actualizado ${formatDateTime(cv.updatedAt)}` : ''}
              </p>
            </Reveal>
          </div>
          <Reveal className="lg:col-span-6">
            <button type="button" onClick={cv.open} disabled={!cv.ready} aria-label="Abrir el CV completo en una pestaña nueva" className="block w-full max-w-[460px] border border-line bg-paper p-0 lg:ml-auto" style={{ cursor: cv.ready ? 'zoom-in' : 'default' }}>
              <img src={cvPreview} alt="Vista previa de la primera página del CV de Frank Pineda" loading="lazy" className="block h-auto w-full" />
            </button>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
