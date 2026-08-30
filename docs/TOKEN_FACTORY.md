# Token Factory

The generic token-factory domain supports issuer profiles:

```text
PROJECT
COMPANY
GOVERNMENT
```

Supply controls:

```text
FIXED_SUPPLY
CAPPED_MINT
RESERVE_BACKED
```

## Policy fields

A production-review policy includes:

- issuer profile
- name / ticker
- decimals
- max supply
- supply control
- restricted transfer requirement
- confidential-transfer intent
- mint authority mode
- optional reserve asset/ratio
- metadata URI

## Safer defaults

- Government: restricted transfers + HSM/MPC-oriented authority.
- Company: multisig authority default.
- Project: multisig authority default.

## Validation

Production review fails for:

- invalid ticker;
- blank name;
- decimals outside 0-9;
- non-positive cap;
- missing metadata;
- government profile without restricted-transfer review;
- reserve-backed mode without reserve asset/ratio;
- reserve-backed mode with revoked genesis authority;
- confidential transfer enabled without dedicated production review.

## Important distinction

`readyForProductionReview` is not equivalent to “mint deployed”. It only means the shared policy has no built-in review errors. Production mint creation still requires signer/custody, transaction, RPC and deployment verification.
