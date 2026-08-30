> See the complete documentation index in [`docs/README.md`](README.md).

# Fee Model v1.0.0

## Contributor checkout

The contributor quote may contain independently named line items for:

- crisis principal;
- deployment-configured PowerChain transaction/service fee, if enabled;
- Token-2022 transfer fee, if the selected token actually has that extension;
- estimated Solana network fee;
- card/onramp/provider fee, if applicable.

The **successful-funding commission is not charged to the contributor checkout in the canonical model**. Its contributor checkout basis points are `0`.

## Successful-funding commission

Where explicitly enabled by a capital-pool policy, a successfully funded pool can incur a **5% commission from successful pool proceeds** after the authoritative committed amount reaches the success threshold.

```text
successful pool proceeds
        ↓
5% total commission
├── 2 percentage points -> Community Treasury
└── 3 percentage points -> Ecosystem & Development Treasury
```

The split should be produced as one atomic transaction where the asset/network supports it, then reconciled against the authoritative chain result before the record becomes `CONFIRMED`.

## Do not stack invisibly

The success commission is independent from Solana network fees, Token-2022 transfer fees, card/onramp provider fees and any per-transaction PowerChain service fee. Every applicable contributor-facing fee must be separately named before authorization.

## Rounding

All fees are calculated from atomic integer units. Basis-point fees use floor rounding so integer rounding cannot charge more than the exact configured percentage. Never calculate settlement amounts using JavaScript floating-point currency arithmetic.
