/** Estilos acotados (prefijo fb-) de Perfil, Credenciales, CV, Contacto y Pie. */
export function BStyles() {
  return <style>{CSS}</style>;
}

// --fg-3 se oscurece/aclara aquí porque el valor base queda por debajo de 4.5:1 en texto pequeño.
const CSS = `
.fb-sec{--fg-3:#8b8c90;--fb-accent:var(--gold)}
.fb-sec.on-paper{--fg-3:#5f5d56;--fb-accent:var(--ink)}
.on-paper :focus-visible{outline-color:var(--ink)}
.fb-sec .input:focus,.fb-sec .textarea:focus{box-shadow:0 0 0 3px var(--gold-soft)}

.fb-row{position:relative;border-top:1px solid var(--line);padding:1.5rem 0}
.fb-row::before{content:'';position:absolute;left:0;right:0;top:-1px;height:1px;background:var(--fb-accent);transform:scaleX(0);transform-origin:left;transition:transform .35s var(--ease)}
.fb-row:hover::before,.fb-row:focus-within::before{transform:scaleX(1)}
.fb-stretch::after{content:'';position:absolute;inset:0}
.fb-stretch:focus-visible{outline:none}
.fb-row:has(.fb-stretch:focus-visible){outline:2px solid var(--gold);outline-offset:2px}
.on-paper .fb-row:has(.fb-stretch:focus-visible){outline-color:var(--ink)}

.fb-skel{background:var(--bg-2);border-radius:6px}
.fb-lead{font-family:var(--font-display);font-weight:500;letter-spacing:-.02em;line-height:1.28;font-size:clamp(1.35rem,2.3vw,1.85rem)}
.fb-cert{display:block;width:100%;text-align:left;background:none;border:0;padding:0;cursor:pointer}
.fb-cert-img{position:relative;display:block;aspect-ratio:4/3;overflow:hidden;border:1px solid var(--line);background:#fff;transition:border-color .25s var(--ease)}
.fb-cert:hover .fb-cert-img{border-color:var(--ink)}
.fb-cert-img img{width:100%;height:100%;object-fit:contain;object-position:center;padding:0}
.fb-link-row{display:flex;align-items:center;justify-content:space-between;gap:1rem;min-height:56px;border-top:1px solid var(--line);text-decoration:none;color:var(--fg);transition:color .2s var(--ease)}
.fb-link-row:hover .fb-v{text-decoration-color:var(--gold)}
.fb-v{font-family:var(--font-display);font-size:clamp(1.1rem,1.6vw,1.3rem);letter-spacing:-.01em;text-decoration:underline;text-decoration-color:var(--fg-3);text-underline-offset:5px;overflow-wrap:anywhere}
.fb-trap{position:absolute!important;left:-10000px;width:1px;height:1px;overflow:hidden}
`;
