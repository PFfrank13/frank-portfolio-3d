import { useEffect } from 'react';
import { useHashRoute } from './lib/hooks.js';
import Site from './components/site/Site.jsx';
import AdminApp from './components/admin/AdminApp.jsx';

/** Rutas por hash (funciona también abriendo el archivo con doble clic):
 *    #/            → sitio público
 *    #/admin/...   → panel de administración                      */
export default function App() {
  const route = useHashRoute();
  const isAdmin = route[0] === 'admin';

  useEffect(() => {
    document.title = isAdmin
      ? 'Panel admin — Frank Pineda'
      : 'Frank Farid Yampier Pineda Ferro — Full-Stack Software Engineer';
    if (isAdmin) window.scrollTo(0, 0);
    document.documentElement.toggleAttribute('data-admin', isAdmin);
  }, [isAdmin]);

  return isAdmin ? <AdminApp route={route.slice(1)} /> : <Site />;
}
