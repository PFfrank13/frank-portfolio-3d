import { Component, lazy, Suspense } from 'react';

const Lanyard = lazy(() => import('../../three/Lanyard.jsx'));
// El fallback vive en el mismo módulo: si falla la carga o no existe el export, se usa un div vacío.
const Fallback = lazy(() =>
  import('../../three/Lanyard.jsx')
    .then((m) => ({ default: m.LanyardFallback || Empty }))
    .catch(() => ({ default: Empty })),
);
function Empty() {
  return <div className="absolute inset-0" aria-hidden />;
}

class Boundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {}
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <Suspense fallback={<Empty />}>
        <Fallback />
      </Suspense>
    );
  }
}

export default function LanyardStage({ className = '', full = false }) {
  return (
    <Boundary>
      <Suspense
        fallback={
          <Suspense fallback={<Empty />}>
            <Fallback />
          </Suspense>
        }
      >
        <Lanyard className={className} full={full} />
      </Suspense>
    </Boundary>
  );
}
