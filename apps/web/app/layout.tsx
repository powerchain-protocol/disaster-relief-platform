import type { Metadata } from "next";
import "./globals.css";
import { ThemeScript } from "./theme-script";
import { WalletProvider } from "../providers/wallet-provider";

export const metadata: Metadata = {
  title: { default: "PowerChain Disaster Relief", template: "%s | PowerChain Relief" },
  description: "Verified disaster-relief capital infrastructure with source-aware Solana operations, evidence and settlement intelligence.",
  icons: {
    icon: [
      { url: "/brand/app-icon-light.png", media: "(prefers-color-scheme: light)" },
      { url: "/brand/app-icon-dark.png", media: "(prefers-color-scheme: dark)" },
    ],
    apple: "/brand/app-icon-light.png",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head><ThemeScript /></head>
      <body>
        <a className="skip" href="#main">Skip to content</a>
        <WalletProvider>{children}</WalletProvider>
      </body>
    </html>
  );
}
