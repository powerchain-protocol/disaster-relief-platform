> See the complete documentation index in [`docs/README.md`](README.md).

# Security Model v1.0.0

## Financial authority chain

```text
Identity
-> Organization
-> Role
-> Permission
-> Resource
-> Policy version
-> Risk
-> Approval threshold
-> Secure signer
-> Blockchain settlement
-> Reconciliation
-> Evidence
-> Impact verification
-> Audit
```

## Hard invariants

1. AI cannot sign treasury transactions.
2. PWRC balance cannot grant treasury authority.
3. Client state cannot confirm settlement.
4. Mainnet cannot silently use demo fixtures.
5. Unknown execution remains `EXECUTION_UNKNOWN` until reconciled.
6. Cross-chain minting halts on backing deficit or unknown source state.
7. Reserve-backed issuance fails closed without a verified reserve state.
8. Sensitive evidence stays private/off-chain unless deliberately classified public.
