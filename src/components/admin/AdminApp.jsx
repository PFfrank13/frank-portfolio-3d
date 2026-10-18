import { lazy, Suspense, useEffect } from 'react';
import { useAdminSession } from '../../lib/hooks.js';
import { DialogHost, Empty, Spinner, ToastHost } from './ui.jsx';
import Gate from './shell/Gate.jsx';
import Layout, { NAV } from './shell/Layout.jsx';
import PageBoundary from './shell/PageBoundary.jsx';

const PAGES = {
  '': lazy(() => import('./Dashboard.jsx')),
  proyectos: lazy(() => import('./Projects.jsx')),
  herramientas: lazy(() => import('./Tools.jsx')),
  certificados: lazy(() => import('./Certificates.jsx')),
  comentarios: lazy(() => import('./Comments.jsx')),
  mensajes: lazy(() => import('./Messages.jsx')),
  ajustes: lazy(() => import('./Settings.jsx')),
};

function NotFound() {
  return <Empty title="Esta página no existe" hint="Revisa la dirección o vuelve al resumen." action={<a href="#/admin" className="btn btn-sm">Ir al resumen</a>} />;
}

/** `route` = segmentos tras "admin": [], ['proyectos'], ['comentarios'], … */
export default function AdminApp({ route = [] }) {
  const { session, loading } = useAdminSession();
  const page = route[0] || '';
  const known = Object.prototype.hasOwnProperty.call(PAGES, page);
  const title = NAV.find((n) => n.id === page)?.label || 'No encontrada';

  useEffect(() => {
    document.title = session ? `${title} · Panel de Frank Pineda` : 'Acceso · Panel de Frank Pineda';
  }, [title, session]);

  if (loading) {
    return (
      <div className="grid min-h-[100dvh] place-items-center">
        <Spinner label="Cargando el panel" />
      </div>
    );
  }

  const Page = known ? PAGES[page] : NotFound;
  return (
    <>
      {session ? (
        <Layout page={known ? page : '404'} title={title}>
          <PageBoundary key={page}>
            <Suspense fallback={<div className="grid place-items-center py-24"><Spinner label="Cargando" /></div>}>
              <Page />
            </Suspense>
          </PageBoundary>
        </Layout>
      ) : (
        <Gate />
      )}
      <ToastHost />
      <DialogHost />
    </>
  );
}
