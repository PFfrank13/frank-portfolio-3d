const CSS = `
@keyframes cm-in{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
@keyframes cm-flash{0%{background-color:rgba(213,176,90,.16);border-color:rgba(213,176,90,.55)}100%{background-color:transparent;border-color:var(--line)}}
@keyframes cm-shimmer{0%{opacity:.5}50%{opacity:1}100%{opacity:.5}}
@keyframes cm-spin{to{transform:rotate(360deg)}}
@keyframes cm-pop{0%{transform:scale(1)}40%{transform:scale(1.28)}100%{transform:scale(1)}}
.cm-sec{position:relative;border-top:1px solid var(--line);background:var(--bg)}
.cm-grid{display:grid;gap:clamp(2.5rem,5vw,4rem);grid-template-columns:minmax(0,1fr)}
@media(min-width:1024px){.cm-grid{grid-template-columns:minmax(0,400px) minmax(0,1fr)}.cm-aside{position:sticky;top:96px;align-self:start}}
.cm-spin{animation:cm-spin .8s linear infinite}
.cm-card{position:relative;display:grid;grid-template-columns:40px minmax(0,1fr);gap:0 14px;padding:20px 0;border-top:1px solid var(--line);border-bottom:1px solid transparent;scroll-margin-top:96px}
.cm-card:first-child{border-top-color:transparent}
.cm-card.cm-fresh-new{animation:cm-in .5s var(--ease) both,cm-flash 3.2s var(--ease) .1s both}
.cm-card.cm-fresh-reply,.cm-card.cm-fresh-pinned{animation:cm-flash 3.2s var(--ease) both}
.cm-card.cm-fresh-new,.cm-card.cm-fresh-reply,.cm-card.cm-fresh-pinned{border-radius:14px;border:1px solid var(--line);padding-inline:14px;margin-inline:-14px}
.cm-avatar{display:grid;place-items:center;width:40px;height:40px;border-radius:50%;border:1px solid var(--line);background:var(--bg-2);font-family:var(--font-display);font-weight:600;font-size:.9rem;color:var(--fg-2);user-select:none}
.cm-avatar-frank{border-color:rgba(213,176,90,.55);color:var(--gold);background:var(--gold-soft)}
.cm-text{white-space:pre-wrap;overflow-wrap:anywhere;word-break:break-word;line-height:1.62;color:var(--fg);font-size:.975rem}
.cm-thumb{display:block;position:relative;margin-top:12px;max-width:min(100%,340px);border-radius:12px;overflow:hidden;border:1px solid var(--line);background:var(--bg-2);cursor:zoom-in;padding:0;transition:border-color .2s var(--ease)}
.cm-thumb:hover{border-color:var(--fg-3)}
.cm-thumb img{display:block;width:100%;max-height:260px;object-fit:cover}
.cm-like{display:inline-flex;align-items:center;gap:.45rem;min-height:44px;margin-left:-10px;padding:0 10px;border-radius:999px;border:0;background:transparent;color:var(--fg-2);font:inherit;font-size:.86rem;font-variant-numeric:tabular-nums;cursor:pointer;transition:color .2s var(--ease),background .2s var(--ease)}
.cm-like:hover:not(:disabled){color:var(--fg);background:var(--bg-2)}
.cm-like[aria-pressed='true']{color:var(--gold)}
.cm-like[aria-pressed='true'] svg{fill:currentColor;animation:cm-pop .35s var(--ease)}
.cm-like:disabled{cursor:default}
.cm-reply{margin-top:14px;padding:14px 16px;border-radius:14px;border:1px solid var(--line);border-left:2px solid var(--gold);background:var(--bg-1)}
.cm-reply+.cm-reply{margin-top:10px}
.cm-reply.cm-fresh{animation:cm-in .5s var(--ease) both}
.cm-drop{display:flex;align-items:center;gap:12px;width:100%;min-height:64px;padding:12px 14px;border-radius:12px;border:1px dashed var(--line);background:var(--bg-1);color:var(--fg-2);font:inherit;text-align:left;cursor:pointer;transition:border-color .2s var(--ease),background .2s var(--ease)}
.cm-drop:hover,.cm-drop[data-over='true']{border-color:var(--gold);background:var(--bg-2);color:var(--fg)}
.cm-skel{display:block;border-radius:8px;background:var(--bg-2);animation:cm-shimmer 1.6s ease-in-out infinite}
.cm-hp{position:absolute!important;left:-9999px;width:1px;height:1px;overflow:hidden}
.cm-err{font-size:.8rem;color:var(--danger);line-height:1.4}
@media(max-width:480px){.cm-card{grid-template-columns:34px minmax(0,1fr);gap:0 11px}.cm-avatar{width:34px;height:34px;font-size:.8rem}}
@media(prefers-reduced-motion:reduce){.cm-card.cm-fresh-new,.cm-card.cm-fresh-reply,.cm-card.cm-fresh-pinned,.cm-reply.cm-fresh{animation:cm-flash 3.2s linear both}.cm-skel{animation:none}}
`;
export default function CmStyles() {
  return <style>{CSS}</style>;
}
