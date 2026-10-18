import { Component } from 'react';
import { RotateCw } from 'lucide-react';
import { Empty } from '../ui.jsx';

/** Si una página del panel falla, el resto del panel sigue funcionando. */
export default class PageBoundary extends Component {
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
      <Empty
        title="Esta página no pudo cargarse"
        hint="Ocurrió un error inesperado. Tus datos están a salvo; vuelve a intentarlo o recarga la página."
        action={<button type="button" className="btn btn-sm" onClick={() => this.setState({ error: null })}><RotateCw size={15} aria-hidden /> Reintentar</button>}
      />
    );
  }
}
