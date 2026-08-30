import { BrandLockup } from "../../components/brand-lockup";
import { ThemeToggle } from "../../components/theme-toggle";
import { SolanaOperationsConsole } from "../../components/solana-operations-console";
export const metadata={title:"Solana Operations"};
export default function SolanaPage(){return <main id="main"><div className="shell"><header className="top"><a className="brand-link" href="/"><BrandLockup compact /></a><nav><ThemeToggle /><a href="/">Product</a><a href="/docs/whitepaper.pdf">Whitepaper</a><a className="button compact" href="/api/swagger">API docs</a></nav></header><section className="page-head"><span className="eyebrow">SOLANA OPERATIONS</span><h1>Source-aware network, program and mint intelligence.</h1><p>All provider credentials remain on the backend. This page uses website-origin API proxies with explicit live/degraded/unavailable states.</p></section><SolanaOperationsConsole/></div></main>}
