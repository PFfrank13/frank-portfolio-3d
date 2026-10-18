export const sectionTitleStyle = {
  fontSize: 'clamp(2.2rem, 5.2vw, 4.2rem)',
  letterSpacing: '-0.03em',
  lineHeight: 1,
  fontWeight: 550,
};

/** Titular de sección: marca de lectura discreta (regla + nombre) y titular tipográfico. */
export default function SectionHead({ kicker, id, children, className = '' }) {
  return (
    <div className={className}>
      {kicker && (
        <p className="mb-6 flex items-center gap-3 text-sm text-fg-3">
          <span aria-hidden className="block h-px w-8 bg-current opacity-60" />
          {kicker}
        </p>
      )}
      <h2 id={id} className="font-display" style={sectionTitleStyle}>
        {children}
      </h2>
    </div>
  );
}
