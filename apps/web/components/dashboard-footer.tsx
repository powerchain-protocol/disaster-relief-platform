import { ExternalLinkIcon } from "@radix-ui/react-icons";
import { BrandLockup } from "./brand-lockup";

export function DashboardFooter() {
  return <footer className="dashboard-footer">
    <div className="shell dashboard-footer-main">
      <div><a className="brand-link" href="/"><BrandLockup compact/></a><p>Source-aware Solana operations, provider observability and program assurance.</p></div>
      <div className="dashboard-footer-links">
        <a href="/status">System status</a><a href="/network">Network</a><a href="/programs">Programs</a><a href="/docs">Docs</a><a href="/api/swagger">Swagger <ExternalLinkIcon/></a>
      </div>
    </div>
    <div className="shell dashboard-footer-bottom"><span>PowerChain Relief · v1.0.0</span><span>Live data remains source-labelled and fail-closed.</span></div>
  </footer>;
}
