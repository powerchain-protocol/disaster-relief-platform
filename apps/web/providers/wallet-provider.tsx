"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { fetchWalletPortfolio } from "../data/fetch-wallet-data";
import type { WalletPortfolioResponse } from "@powerchain/crisis-api-client";

export type WalletKind = "Phantom" | "Solflare" | "Backpack";
type PublicKeyLike = { toString(): string };
type InjectedWallet = {
  publicKey?: PublicKeyLike;
  isConnected?: boolean;
  connect(opts?: { onlyIfTrusted?: boolean }): Promise<{ publicKey?: PublicKeyLike } | void>;
  disconnect?(): Promise<void>;
  on?(event: "accountChanged" | "disconnect", listener: (...args: unknown[]) => void): void;
  off?(event: "accountChanged" | "disconnect", listener: (...args: unknown[]) => void): void;
};

declare global {
  interface Window {
    phantom?: { solana?: InjectedWallet };
    solana?: InjectedWallet & { isPhantom?: boolean };
    solflare?: InjectedWallet & { isSolflare?: boolean };
    backpack?: InjectedWallet;
  }
}

type WalletContextValue = {
  address: string | null;
  wallet: WalletKind | null;
  connected: boolean;
  portfolio: WalletPortfolioResponse | null;
  portfolioLoading: boolean;
  portfolioError: string | null;
  installed: Record<WalletKind, boolean>;
  connect(kind: WalletKind): Promise<void>;
  disconnect(): Promise<void>;
  refreshPortfolio(): Promise<void>;
};

const WalletContext = createContext<WalletContextValue | null>(null);
const PREFERRED_WALLET_KEY = "powerchain-wallet-kind";

function providerFor(kind: WalletKind): InjectedWallet | null {
  if (typeof window === "undefined") return null;
  if (kind === "Phantom") return window.phantom?.solana || (window.solana?.isPhantom ? window.solana : null) || null;
  if (kind === "Solflare") return window.solflare || null;
  return window.backpack || null;
}

function walletAddress(value: unknown) {
  if (!value) return null;
  if (typeof value === "object" && value && "toString" in value && typeof (value as PublicKeyLike).toString === "function") {
    return (value as PublicKeyLike).toString();
  }
  return null;
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [wallet, setWallet] = useState<WalletKind | null>(null);
  const [portfolio, setPortfolio] = useState<WalletPortfolioResponse | null>(null);
  const [portfolioLoading, setPortfolioLoading] = useState(false);
  const [portfolioError, setPortfolioError] = useState<string | null>(null);
  const [installed, setInstalled] = useState<Record<WalletKind, boolean>>({ Phantom: false, Solflare: false, Backpack: false });

  const loadPortfolio = useCallback(async (walletAddressValue: string) => {
    setPortfolioLoading(true);
    setPortfolioError(null);
    try { setPortfolio(await fetchWalletPortfolio(walletAddressValue)); }
    catch (error) {
      setPortfolio(null);
      setPortfolioError(error instanceof Error ? error.message : "Wallet data unavailable");
    } finally { setPortfolioLoading(false); }
  }, []);

  const clear = useCallback(() => {
    setAddress(null); setWallet(null); setPortfolio(null); setPortfolioError(null);
  }, []);

  useEffect(() => {
    setInstalled({
      Phantom: Boolean(providerFor("Phantom")),
      Solflare: Boolean(providerFor("Solflare")),
      Backpack: Boolean(providerFor("Backpack")),
    });

    const preferred = localStorage.getItem(PREFERRED_WALLET_KEY) as WalletKind | null;
    if (!preferred || !providerFor(preferred)) return;
    const provider = providerFor(preferred);
    provider?.connect({ onlyIfTrusted: true }).then(result => {
      const next = result && typeof result === "object" && "publicKey" in result ? walletAddress(result.publicKey) : walletAddress(provider?.publicKey);
      if (next) {
        setWallet(preferred); setAddress(next); void loadPortfolio(next);
      }
    }).catch(() => {});
  }, [loadPortfolio]);

  useEffect(() => {
    if (!wallet) return;
    const provider = providerFor(wallet);
    if (!provider?.on) return;
    const onAccountChanged = (...args: unknown[]) => {
      const next = walletAddress(args[0]) || walletAddress(provider.publicKey);
      if (!next) { clear(); return; }
      setAddress(next); setPortfolio(null); void loadPortfolio(next);
    };
    const onDisconnect = () => clear();
    provider.on("accountChanged", onAccountChanged);
    provider.on("disconnect", onDisconnect);
    return () => {
      provider.off?.("accountChanged", onAccountChanged);
      provider.off?.("disconnect", onDisconnect);
    };
  }, [wallet, clear, loadPortfolio]);

  const connect = useCallback(async (kind: WalletKind) => {
    const provider = providerFor(kind);
    if (!provider) throw new Error(`${kind} wallet was not detected in this browser`);
    const result = await provider.connect();
    const next = result && typeof result === "object" && "publicKey" in result ? walletAddress(result.publicKey) : walletAddress(provider.publicKey);
    if (!next) throw new Error(`${kind} did not return a public key`);
    localStorage.setItem(PREFERRED_WALLET_KEY, kind);
    setWallet(kind); setAddress(next); await loadPortfolio(next);
  }, [loadPortfolio]);

  const disconnect = useCallback(async () => {
    const provider = wallet ? providerFor(wallet) : null;
    await provider?.disconnect?.();
    localStorage.removeItem(PREFERRED_WALLET_KEY);
    clear();
  }, [wallet, clear]);

  const refreshPortfolio = useCallback(async () => { if (address) await loadPortfolio(address); }, [address, loadPortfolio]);

  const value = useMemo(() => ({
    address, wallet, connected: Boolean(address), portfolio, portfolioLoading, portfolioError, installed,
    connect, disconnect, refreshPortfolio,
  }), [address, wallet, portfolio, portfolioLoading, portfolioError, installed, connect, disconnect, refreshPortfolio]);

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const value = useContext(WalletContext);
  if (!value) throw new Error("useWallet must be used inside WalletProvider");
  return value;
}
