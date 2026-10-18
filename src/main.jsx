import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles/index.css';
import { installGuard } from './lib/guard.js';

/** Último recurso: si algo falla de forma inesperada, mostramos un mensaje en vez de pantalla en blanco. */
class RootBoundary extends React.Component {
  state = { error: null };
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error) {
    console.error(error);
  }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, textAlign: 'center' }}>
        <div style={{ maxWidth: 520 }}>
          <h1 style={{ fontSize: 28, marginBottom: 12 }}>Frank Farid Yampier Pineda Ferro</h1>
          <p style={{ color: 'var(--fg-2)' }}>Full-Stack Software Engineer · Ica, Perú</p>
          <p style={{ color: 'var(--fg-3)', marginTop: 20 }}>
            No se pudo cargar la página. Recarga o prueba en otro navegador. Contacto: pinedaferrof@gmail.com
          </p>
        </div>
      </div>
    );
  }
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RootBoundary>
      <App />
    </RootBoundary>
  </React.StrictMode>
);

if (import.meta.env.PROD) installGuard(); // en desarrollo (npm run dev) queda libre para poder depurar
window.__APP_MOUNTED__ = true;
