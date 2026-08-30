# PowerChain Crisis v1.0.0 - Production Improvements

## 1. Financial state is explicit

Never collapse these values:

```text
Need -> Committed -> Available -> Allocated -> Escrowed -> Released -> Delivered -> Verified -> Reconciled
```

Every dashboard, API response and public transparency page should expose the state label, source and observation timestamp.

## 2. Fee stack is explicit

Checkout must show each fee independently before authorization:

```text
Principal
+ PowerChain service fee (if configured)
+ Successful-funding commission (if this product/pool policy enables it)
+ Solana network fee estimate
+ Token-2022 transfer fee (only when the chosen token has one)
+ Onramp/provider fee (only for that rail)
```

Do not label a 5% successful-funding commission as a Solana fee or a PWRC transfer fee.

## 3. Quote and policy binding

Every transaction intent binds:

- `quoteId`
- `quoteHash`
- `policyVersion`
- `feeScheduleVersion`
- `network`
- `programId` or settlement primitive
- `asset`
- `amountAtomic`
- `purpose`
- `destination`
- `expiresAt`
- `idempotencyKey`

If any material field changes, the transaction must be re-quoted and re-simulated.

## 4. PWRC remains utility, not treasury authority

PWRC powers access, compute, API services, participation, reviewed incentives and economic governance. Crisis capital remains separate.

```text
PWRC balance
!= identity
!= verified organization
!= treasury role
!= approval
!= signer authority
```

## 5. Cross-chain routes are provider-specific

CCTP, CCIP and wPWRC-to-Sui are separate routes with different trust assumptions. Every route has:

- provider identity;
- source/destination chain identifiers;
- route state;
- route cap;
- confirmation/finality policy;
- replay key;
- pause control;
- audit status;
- reconciliation procedure.

Disabled/TBA/unaudited routes are not executable.

## 6. wPWRC conservation is measurable

The planned Sui representation must satisfy:

```text
verified PWRC locked/burned for bridge
>= outstanding wPWRC
```

Production should maintain continuous supply reconciliation and alert on any deficit or unknown state.

## 7. Token factory uses safer issuer defaults

One factory supports `PROJECT`, `COMPANY`, and `GOVERNMENT` profiles, but policy defaults differ.

- Project: capped mint; transfer controls optional.
- Company: capped mint; organization approval and treasury policy required.
- Government: restricted-transfer posture by default; issuer, compliance and redemption/purpose policy required.
- Reserve-backed: separate reserve verification and redemption policy required.

A one-billion-unit default is a planning cap, not an automatic mint.

## 8. Community rewards are bounded

Rewards use epoch budgets, evidence references, deduplication and challenge/reversal procedures. Passive holding does not automatically generate rewards.

## 9. Confidential Transfer is an opt-in capability

Token-2022 Confidential Transfer can hide eligible transfer amounts and balances while account addresses, mint and ownership remain public. It requires client-side proof support, compatible wallets/custody/indexing, and explicit audit/privacy review before production enablement.

## 10. Deployment status is visible

Use only:

- `LIVE`
- `DEGRADED`
- `DISABLED`
- `TBA`
- `UNAVAILABLE`

Do not display `Operational` from static configuration when the service has not been checked.

## 11. AI authority is bounded

Agents may consume PWRC utility budgets and prepare recommendations. They cannot:

- release crisis escrow;
- change treasury policy;
- sign treasury transactions;
- mark impact verified;
- invent evidence, prices, balances or settlement.

## 12. Production release requires evidence

No mainnet claim without:

- reproducible build;
- configured mainnet registry;
- audited/approved program IDs;
- secure signer policy;
- verified database migrations/RLS;
- RPC/webhook redundancy;
- incident procedures;
- reconciliation tests;
- dependency/security review.

## Visual data architecture upgrade

The architecture/chart layer now includes typed chart metadata, demo/live status semantics, source/freshness labels, reusable line charts, orthogonal SVG connectors and explicit arrowheads. The six public architecture diagrams use one consistent line/arrow grammar and are suitable for the website, dashboard, documentation portal and whitepaper.
