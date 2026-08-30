# SPL and Token-2022 Mint Inspection

## Endpoint

```text
GET /api/v1/solana/assets/:mint
```

## Authority model

The service reads token state directly from Solana RPC.

1. `getTokenSupply` -> supply and decimals.
2. `getAccountInfo(..., base64)` -> account owner and raw mint bytes.
3. `getAccountInfo(..., jsonParsed)` -> parsed mint state/extensions when the RPC supports them.
4. optional Helius DAS -> metadata enrichment only.

Helius metadata cannot replace RPC supply or authority truth.

## Token-program classification

The mint owner determines:

- `SPL_TOKEN`
- `TOKEN_2022`
- `UNKNOWN`

Unknown owners return `UNSUPPORTED_TOKEN_PROGRAM` rather than being guessed.

## Returned fields

```text
mint
network
status
source

tokenProgram
tokenProgramKind
accountDataLength

decimals
supplyAtomic
uiAmountString
initialized

authorities.mintAuthority
authorities.freezeAuthority

extensions[]
extensionParsing

name
symbol
interface
metadataUri
image
priceUsd (optional metadata enrichment)
```

## Authorities

A `null` mint authority means the mint cannot be expanded through the normal mint authority path. A `null` freeze authority means the standard freeze authority is absent. These facts should be displayed as explicit state, not as missing UI.

## Token-2022 extensions

When `jsonParsed` returns extension state, PowerChain exposes normalized entries:

```json
{
  "name": "transferFeeConfig",
  "source": "RPC_JSON_PARSED",
  "details": { "...": "..." }
}
```

Extension availability depends on RPC parser support. If parsing is unavailable, the API returns `extensionParsing: "UNAVAILABLE"`; it does not infer extensions solely from account length.
