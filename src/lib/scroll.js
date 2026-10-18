// Estado de scroll compartido entre el sitio (Lenis) y la escena 3D (que lo lee en cada frame).
// Site.jsx lo actualiza; three/Lanyard.jsx solo lo lee. Nunca causa re-renders de React.
export const scrollState = {
  y: 0, // píxeles desplazados
  velocity: 0, // px por frame aprox. (positivo = bajando)
  progress: 0, // 0..1 de toda la página
};
