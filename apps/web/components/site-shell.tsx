import { BrandLockup } from "./brand-lockup";
import { ProductDropdown } from "./product-dropdown";
import { ThemeToggle } from "./theme-toggle";
import { WalletConnectModal } from "./wallet-connect-modal";
import { MobileNav } from "./mobile-nav";

export function SiteHeader() {
  return <header className="site-header"><div className="shell header-inner">
    <a className="brand-link" href="/" aria-label="PowerChain Disaster Relief home"><BrandLockup /></a>
    <nav className="site-nav" aria-label="Primary navigation">
      <ProductDropdown />
      <a href="/about">About</a><a href="/programs">Programs</a><a href="/network">Network</a><a href="/status">Status</a><a href="/docs">Docs</a><a href="/legal">Legal</a>
    </nav>
    <div className="header-actions"><ThemeToggle /><WalletConnectModal /><a className="button compact" href="/solana">View dashboard</a><MobileNav /></div>
  </div></header>;
}

export function SiteFooter() {
  return <footer className="site-footer"><div className="shell footer-grid">
    <div className="footer-brand"><a className="brand-link" href="/"><BrandLockup /></a><p>Verified capital infrastructure for emergency response.</p></div>
    <div><b>Product</b><a href="/about">Overview</a><a href="/solana">Dashboard</a><a href="/programs">Programs</a></div>
    <div><b>Resources</b><a href="/docs">Documentation</a><a href="/docs/whitepaper.pdf">Whitepaper</a><a href="/api/swagger">Swagger</a><a href="/api/v1/openapi.json">OpenAPI</a></div>
    <div><b>Company</b><a href="/about">About</a><a href="/network">Network</a><a href="/status">Status</a><a href="/legal">Legal</a></div>
  </div><div className="shell footer-bottom"><span>PowerChain Disaster Relief · v1.0.0</span><span>Raised ≠ allocated ≠ released ≠ verified impact.</span></div></footer>;
}
