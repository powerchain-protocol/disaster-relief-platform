"use client";

import { useEffect, useState } from "react";

const links = [
  ["/about", "About"],
  ["/programs", "Programs"],
  ["/network", "Network"],
  ["/status", "Status"],
  ["/docs", "Documentation"],
  ["/docs/whitepaper.pdf", "Whitepaper"],
  ["/legal", "Legal"],
];

export function MobileNav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", close);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  return <>
    <button type="button" className="mobile-nav-trigger" aria-expanded={open} aria-controls="mobile-nav-panel" onClick={() => setOpen(true)}>
      <span/><span/><span/><b className="sr-only">Open navigation</b>
    </button>
    {open ? <div className="mobile-nav-backdrop" onMouseDown={event => { if (event.currentTarget === event.target) setOpen(false); }}>
      <aside id="mobile-nav-panel" className="mobile-nav-panel" aria-label="Mobile navigation">
        <div className="mobile-nav-head">
          <strong>Navigation</strong>
          <button type="button" onClick={() => setOpen(false)} aria-label="Close navigation">×</button>
        </div>
        <nav>{links.map(([href,label]) => <a key={href} href={href} onClick={() => setOpen(false)}>{label}<span>→</span></a>)}</nav>
        <div className="mobile-nav-actions">
          <a className="button" href="/solana">View dashboard</a>
          <a className="button secondary" href="/api/swagger">API docs</a>
        </div>
      </aside>
    </div> : null}
  </>;
}
