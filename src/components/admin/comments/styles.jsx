const CSS = `
@keyframes ac-flash{0%{background-color:rgba(213,176,90,.14);border-color:rgba(213,176,90,.55)}100%{background-color:transparent;border-color:var(--line)}}
@keyframes ac-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.ac-item{position:relative;padding:18px 16px;border-top:1px solid var(--line);border-left:2px solid transparent;transition:opacity .2s var(--ease)}
.ac-item:first-child{border-top-color:transparent}
.ac-item[data-pinned='true']{border-left-color:var(--gold)}
.ac-item[data-fresh]{animation:ac-flash 3.2s var(--ease) both}
.ac-item[aria-busy='true']{opacity:.55}
.ac-text{white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.6;font-size:.95rem}
.ac-thumb{display:block;margin-top:10px;width:min(100%,260px);border-radius:12px;overflow:hidden;border:1px solid var(--line);background:var(--bg-2);padding:0;cursor:zoom-in}
.ac-thumb img{display:block;width:100%;max-height:200px;object-fit:cover}
.ac-act{min-height:44px;min-width:44px}
.ac-act[aria-pressed='true']{color:var(--gold);border-color:rgba(213,176,90,.5)}
.ac-act[aria-pressed='true'] svg{fill:currentColor}
.ac-reply{margin-top:10px;padding:12px 14px;border-radius:12px;border:1px solid var(--line);border-left:2px solid var(--gold);background:var(--bg-1);animation:ac-in .3s var(--ease) both}
.ac-reply[aria-busy='true']{opacity:.6}
.ac-filter{display:inline-flex;align-items:center;gap:8px;min-height:44px;padding:0 14px;border-radius:999px;border:1px solid var(--line);background:transparent;color:var(--fg-2);font:inherit;font-size:.88rem;cursor:pointer;transition:background .2s var(--ease),color .2s var(--ease),border-color .2s var(--ease)}
.ac-filter:hover{background:var(--bg-2);color:var(--fg)}
.ac-filter[aria-pressed='true']{background:var(--fg);border-color:var(--fg);color:var(--bg)}
.ac-filter b{font-weight:600;font-variant-numeric:tabular-nums}
@media(prefers-reduced-motion:reduce){.ac-item[data-fresh]{animation:none;background:rgba(213,176,90,.1)}.ac-reply{animation:none}}
`;
export default function AcStyles() {
  return <style>{CSS}</style>;
}
