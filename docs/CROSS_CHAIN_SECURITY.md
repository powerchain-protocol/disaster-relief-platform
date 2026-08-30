> See the complete documentation index in [`docs/README.md`](README.md).

# Cross-chain Security v1.0.0

## Route model

Every cross-chain route is a configured object, not a generic bridge switch.

Required fields:

```text
routeId
provider
asset
sourceChain
sourceDomain/selector
sourceFinality
sourceProgram
sourceCustody

destinationChain
destinationDomain/selector
destinationProgram

auditStatus
routeStatus
maxPerTransferAtomic
maxOutstandingAtomic
pauseState
```

## CCTP

Use CCTP for native USDC movement only when both domains and the intended version are supported at execution time. Provider fee and attestation/message status must be discovered dynamically.

## CCIP

CCIP remains disabled until router/pool/lane configuration, allowlists, rate limits, custody assumptions and audit state are complete.

## wPWRC on Sui

The planned route is not crisis-capital infrastructure. It is a future utility representation for PowerChain Energy and selected network use cases.

Mandatory invariant:

```text
outstanding wPWRC <= verified backing PWRC
```

Unknown bridge state should halt new minting until reconciliation completes.
