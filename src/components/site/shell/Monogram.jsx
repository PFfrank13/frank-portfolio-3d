/** Monograma FP: dos letras en un cuadrado de borde fino. */
export default function Monogram({ size = 34 }) {
  return (
    <span
      aria-hidden
      className="font-display inline-grid place-items-center rounded-[10px] border border-current text-[0.8rem] font-semibold leading-none tracking-tight"
      style={{ width: size, height: size }}
    >
      FP
    </span>
  );
}
