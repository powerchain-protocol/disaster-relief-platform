export function BrandLockup({ compact = false }: { compact?: boolean }) {
  return (
    <span className={compact ? "brand-lockup compact-brand" : "brand-lockup"}>
      <span className="brand-logo-wrap" aria-hidden="true">
        <img className="brand-logo brand-logo-light" src="/brand/logo-green.png" alt="" />
        <img className="brand-logo brand-logo-dark" src="/brand/logo-white.png" alt="" />
      </span>
      <span className="brand-copy">
        <span className="brand-wordmark"><span className="brand-power">Power</span><span className="brand-chain">Chain</span></span>
        <span className="brand-subline">RELIEF NETWORK</span>
      </span>
    </span>
  );
}
