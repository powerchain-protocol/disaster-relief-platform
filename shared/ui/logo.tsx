export type PowerChainLogoProps = {
  compact?: boolean;
  product?: string;
  subtitle?: string;
  tone?: "brand" | "dark" | "light";
  size?: "sm" | "md" | "lg";
  className?: string;
};

const markByTone = {
  brand: "/assets/powerchain-mark.png",
  dark: "/assets/powerchain-mark.png",
  light: "/assets/powerchain-mark.png",
} as const;

export function PowerChainLogo({
  compact = false,
  product = "DISASTER RELIEF",
  subtitle,
  tone = "brand",
  size = "md",
  className = "",
}: PowerChainLogoProps) {
  const secondary = (subtitle ?? product).trim().toUpperCase();
  const length = secondary.length > 22 ? "xl" : secondary.length > 15 ? "long" : "short";

  return (
    <span
      className={`pc-logo pc-logo-${tone} pc-logo-${size} ${className}`.trim()}
      data-subtitle-length={length}
      aria-label={`PowerChain ${secondary}`}
    >
      <img className="pc-logo-mark" src={markByTone[tone]} alt="" aria-hidden="true" />
      {!compact && (
        <span className="pc-logo-copy">
          <span className="pc-logo-wordmark" aria-hidden="true"><b>Power</b><i>Chain</i></span>
          <small className="pc-logo-subtitle">{secondary}</small>
        </span>
      )}
    </span>
  );
}

export const powerChainLogoCss = `
.pc-logo{display:inline-flex;align-items:center;gap:9px;min-width:0;text-decoration:none}
.pc-logo-mark{width:32px;height:32px;object-fit:contain;flex:0 0 auto}
.pc-logo-copy{display:grid;min-width:0;line-height:1}
.pc-logo-wordmark{display:flex;align-items:baseline;white-space:nowrap;font-size:16px;letter-spacing:-.04em;color:#111513}
.pc-logo-wordmark b{font-weight:720}.pc-logo-wordmark i{font-style:normal;font-weight:340}
.pc-logo-subtitle{margin-top:5px;font-size:8px;font-weight:760;letter-spacing:.16em;color:#66706A;white-space:nowrap}
.pc-logo[data-subtitle-length="long"] .pc-logo-subtitle{font-size:7px;letter-spacing:.11em}
.pc-logo[data-subtitle-length="xl"] .pc-logo-subtitle{font-size:6.5px;letter-spacing:.08em}
.pc-logo-sm .pc-logo-mark{width:27px;height:27px}.pc-logo-sm .pc-logo-wordmark{font-size:14px}
.pc-logo-lg .pc-logo-mark{width:40px;height:40px}.pc-logo-lg .pc-logo-wordmark{font-size:20px}
.pc-logo-light .pc-logo-wordmark{color:#fff}.pc-logo-light .pc-logo-subtitle{color:#c9d5ce}
@media(max-width:640px){.pc-logo-mark{width:29px;height:29px}.pc-logo-subtitle{display:none}}
`;
