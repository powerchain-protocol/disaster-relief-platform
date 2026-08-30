"use client";

import { useState } from "react";
import { useWallet, type WalletKind } from "../providers/wallet-provider";

const wallets: Array<{ kind: WalletKind; note: string }> = [
  { kind: "Phantom", note: "Injected Solana wallet" },
  { kind: "Solflare", note: "Solana-native wallet" },
  { kind: "Backpack", note: "Solana wallet extension" },
];

const compact = (value: string) => `${value.slice(0, 5)}…${value.slice(-5)}`;

export function WalletConnectModal() {
  const [open, setOpen] = useState(false);
  const [working, setWorking] = useState<WalletKind | null>(null);
  const [error, setError] = useState<string | null>(null);
  const wallet = useWallet();

  async function connect(kind: WalletKind) {
    setWorking(kind); setError(null);
    try { await wallet.connect(kind); setOpen(false); }
    catch (e) { setError(e instanceof Error ? e.message : "Wallet connection failed"); }
    finally { setWorking(null); }
  }

  if (wallet.connected && wallet.address) {
    return <div className="wallet-chip">
      <button type="button" className="wallet-chip-main" onClick={() => setOpen(true)}>
        <span className="wallet-dot"/><span>{wallet.wallet}</span><b>{compact(wallet.address)}</b>
      </button>
      <button type="button" className="wallet-disconnect" onClick={() => void wallet.disconnect()} aria-label="Disconnect wallet">×</button>
      {open ? <WalletPanel onClose={() => setOpen(false)} connected /> : null}
    </div>;
  }

  return <>
    <button type="button" className="button secondary compact wallet-connect-button" onClick={() => setOpen(true)}>Connect wallet</button>
    {open ? <WalletPanel onClose={() => setOpen(false)} error={error}>
      {wallets.map(({ kind, note }) => {
        const detected = wallet.installed[kind];
        return <button key={kind} type="button" className="wallet-option" disabled={Boolean(working) || !detected} onClick={() => void connect(kind)}>
          <span className="wallet-option-icon">{kind.slice(0,1)}</span>
          <span><b>{kind}</b><small>{working === kind ? "Connecting…" : detected ? note : "Not detected"}</small></span>
          <i>{detected ? "→" : "—"}</i>
        </button>;
      })}
    </WalletPanel> : null}
  </>;
}

function WalletPanel({ onClose, error, connected = false, children }: { onClose(): void; error?: string | null; connected?: boolean; children?: React.ReactNode }) {
  const wallet = useWallet();
  return <div className="wallet-modal-backdrop" role="presentation" onMouseDown={event => { if (event.currentTarget === event.target) onClose(); }}>
    <section className="wallet-modal" role="dialog" aria-modal="true" aria-labelledby="wallet-title">
      <div className="wallet-modal-head"><div><span className="eyebrow">SOLANA WALLET</span><h2 id="wallet-title">{connected ? "Wallet connected" : "Connect wallet"}</h2></div><button type="button" className="wallet-modal-close" onClick={onClose}>×</button></div>
      {connected && wallet.address ? <div className="wallet-portfolio">
        <div><small>ADDRESS</small><b>{wallet.address}</b><button className="wallet-copy" type="button" onClick={() => void navigator.clipboard?.writeText(wallet.address!)}>Copy address</button></div>
        <div className="wallet-summary"><span><small>SOL</small><b>{wallet.portfolioLoading ? "Loading…" : wallet.portfolio?.native.sol?.toLocaleString(undefined,{maximumFractionDigits:6}) ?? "—"}</b></span><span><small>ASSETS</small><b>{wallet.portfolio?.assets.total ?? "—"}</b></span></div>
        {wallet.portfolio?.assets.items?.length ? <div className="wallet-assets"><small>ASSETS</small>{wallet.portfolio.assets.items.slice(0,5).map(asset => <div key={asset.id}><span>{asset.image ? <img src={asset.image} alt="" /> : <i/>}<b>{asset.symbol || asset.name || "Asset"}</b></span><strong>{asset.uiAmount == null ? "—" : asset.uiAmount.toLocaleString(undefined,{maximumFractionDigits:6})}</strong></div>)}</div> : null}
        {wallet.portfolioError ? <p className="validate-error">{wallet.portfolioError}</p> : null}
        <button type="button" className="button secondary" onClick={() => void wallet.refreshPortfolio()}>Refresh wallet data</button>
      </div> : children}
      {error ? <p className="validate-error">{error}</p> : null}
      <p className="wallet-modal-note">Connecting a wallet does not authenticate an operator or grant treasury authority.</p>
    </section>
  </div>;
}
