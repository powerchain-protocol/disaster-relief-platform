import { DashboardIcon, ExternalLinkIcon, FileTextIcon, HomeIcon } from "@radix-ui/react-icons";
import { BrandLockup } from "./brand-lockup";
import { ThemeToggle } from "./theme-toggle";
import { WalletConnectModal } from "./wallet-connect-modal";
import { MobileNav } from "./mobile-nav";

export function DashboardHeader() {
  return <header className="dashboard-header"><div className="shell dashboard-header-inner">
    <a className="brand-link" href="/" aria-label="PowerChain Relief home"><BrandLockup compact/></a>
    <nav className="dashboard-nav" aria-label="Dashboard navigation">
      <a className="dashboard-nav-button" href="/"><HomeIcon/>Product</a>
      <a className="dashboard-nav-button" href="/docs/whitepaper.pdf"><FileTextIcon/>Whitepaper</a>
      <a className="dashboard-nav-button" href="/programs"><DashboardIcon/>Programs</a>
      <a className="dashboard-nav-button" href="/api/swagger">API docs<ExternalLinkIcon/></a>
    </nav>
    <div className="dashboard-actions"><WalletConnectModal/><ThemeToggle/><MobileNav/></div>
  </div></header>;
}
