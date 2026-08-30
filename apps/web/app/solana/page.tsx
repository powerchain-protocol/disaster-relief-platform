import { DashboardHeader } from "../../components/dashboard-header";
import { DashboardFooter } from "../../components/dashboard-footer";
import { SolanaOperationsConsole } from "../../components/solana-operations-console";
import { DashboardMotionShell } from "../../components/dashboard-motion-shell";

export const metadata = { title: "Solana Operations | PowerChain Relief" };

export default function SolanaPage() {
  return <main id="main" className="dashboard-page">
    <DashboardHeader/>
    <section className="shell dashboard-hero">
      <div><span className="eyebrow">SOLANA OPERATIONS</span><h1>Network truth, programs and provider health.</h1><p>Inspect live Solana state through server-side provider boundaries. Missing data stays unavailable rather than becoming synthetic dashboard values.</p></div>
      <div className="dashboard-hero-links"><a className="button dashboard-white-button" href="/">Product</a><a className="button dashboard-white-button" href="/docs/whitepaper.pdf">Whitepaper</a></div>
    </section>
    <section className="shell dashboard-console-wrap"><DashboardMotionShell><SolanaOperationsConsole/></DashboardMotionShell></section>
    <DashboardFooter/>
  </main>;
}
