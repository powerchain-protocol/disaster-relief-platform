"use client";

import { useEffect, useRef, useState } from "react";

const links = [
  { href: "/about", title: "Overview", body: "Product, mission and operating model." },
  { href: "/solana", title: "Operations Console", body: "Solana, programs, markets and providers." },
  { href: "/programs", title: "Programs", body: "Deployment registry and verification controls." },
  { href: "/network", title: "Network", body: "Settlement, providers and system architecture." },
];

export function ProductDropdown() {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointer(event: PointerEvent) {
      if (open && wrap.current && !wrap.current.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="product-menu" ref={wrap}>
      <button className="nav-menu-trigger" type="button" onClick={() => setOpen(v => !v)} aria-expanded={open} aria-haspopup="menu">
        Product <span aria-hidden="true">⌄</span>
      </button>
      {open && (
        <div className="product-menu-panel" role="menu">
          <div className="product-menu-links">
            <span className="menu-kicker">POWERCHAIN RELIEF</span>
            {links.map(item => (
              <a role="menuitem" key={item.href} href={item.href} onClick={() => setOpen(false)}>
                <strong>{item.title}</strong><span>{item.body}</span>
              </a>
            ))}
          </div>
          <a className="product-menu-card" href="/solana" onClick={() => setOpen(false)}>
            <img src="/assets/relief-network-hero.svg" alt="" />
            <span><b>Product preview</b><small>Open the operational console →</small></span>
          </a>
        </div>
      )}
    </div>
  );
}
