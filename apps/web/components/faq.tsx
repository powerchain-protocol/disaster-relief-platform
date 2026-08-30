const items = [
  ["How does the live dashboard update?", "The dashboard uses bounded polling for canonical API resources and a WebSocket snapshot channel for Solana overview and program updates. If the stream disconnects, the client reconnects with capped exponential backoff while REST state remains independently source-labelled."],
  ["Are dashboard values simulated when APIs fail?", "No. Live surfaces keep values stale, degraded or unavailable as appropriate. Prices, balances, program state and settlement outcomes are never invented to keep a card populated."],
  ["What does the health endpoint prove?", "Health proves process liveness and returns non-secret runtime facts such as uptime, Node version and process memory. Strict readiness is separate and can require chain identity, provider quorum, program verification and SLO checks."],
  ["What is PowerChain Disaster Relief?", "PowerChain Disaster Relief is a crisis-capital and evidence infrastructure product. It separates capital state, policy authorization, Solana settlement visibility and verified-impact evidence rather than collapsing them into one balance."],
  ["Does PowerChain replace emergency-response organizations?", "No. The product is infrastructure for transparent funding, routing, controls, settlement intelligence and evidence. Operational response remains with authorized organizations, operators and governments."],
  ["Is PWRC disaster-relief capital?", "No. PWRC is a network utility asset. Emergency capital and settlement use configured financial assets such as USDC or SOL; PWRC does not grant treasury authority."],
  ["How is Solana used?", "Solana provides settlement and program truth. The platform verifies cluster identity, required programs, Token-2022 assets and transaction state while keeping application operations and large evidence records off-chain where appropriate."],
  ["What happens when provider data is unavailable?", "The platform fails explicitly. Missing or stale provider data is marked degraded or unavailable; it is never replaced by invented prices, balances, transaction states or demo values in live mode."],
  ["Can AI release funds?", "No. AI can recommend, explain or flag. Deterministic policy evaluates controls, humans authorize, and cryptographic signers execute."],
  ["Does connecting a wallet sign me in?", "No. Wallet connection is a blockchain interaction boundary. Operator authentication, organizational roles, policy scope and signing authority are separate controls."],
  ["What does verified impact mean?", "Verified impact is an evidence-backed outcome state. A released or spent amount is not automatically treated as delivered aid or verified impact."],
  ["How are program upgrades controlled?", "Configured Solana programs can be checked for executable state, recognized loader, ProgramData metadata and deployment fingerprints. Production change control can require an exact approved fingerprint transition."],
  ["Is the public dashboard required to expose provider credentials?", "No. Helius, Pyth, Birdeye and CoinGecko credentials stay server-side. The browser consumes same-origin API routes and receives source status without provider secrets."]
];

export function FAQ() {
  return (
    <section id="faq" className="section faq-section">
      <div className="shell faq-layout">
        <div><span className="eyebrow">FAQ</span><h2 className="section-title">Frequently asked questions.</h2><p className="section-copy">Clear answers about funding, settlement, wallets, evidence, providers and execution authority.</p></div>
        <div className="faq-list">
          {items.map(([q,a]) => <details key={q}><summary>{q}<span aria-hidden="true">+</span></summary><p>{a}</p></details>)}
        </div>
      </div>
    </section>
  );
}
