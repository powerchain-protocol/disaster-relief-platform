# Fees and Economics

## Contributor fee quote

The contributor quote may contain:

- principal
- service fee
- token transfer fee
- estimated network fee
- provider/onramp fee

It explicitly contains:

```text
successCommissionChargedNowAtomic = 0
```

The 5% successful-funding commission is not silently added to contributor checkout.

## Successful-funding commission

After a configured pool is successfully funded, the shared fee model calculates:

```text
5% total
  2 percentage points -> Community Treasury
  3 percentage points -> Ecosystem & Development
```

The commission source is:

```text
SUCCESSFUL_POOL_PROCEEDS
```

and `contributorChargeAtomic = 0`.

## Rounding

The shared v1 fee helper uses integer atomic-unit math and basis-point floor division:

```text
fee = principalAtomic * bps / 10,000
```

Any product using a different rounding rule must define that rule explicitly rather than silently reusing this helper.

## Disclosure rule

Before a user authorizes a payment, display every amount they are actually charged. Do not conflate:

- service fee;
- network fee estimate;
- token transfer fee;
- provider/onramp fee;
- post-success commission.

## Accounting separation

Community/Ecosystem commission proceeds must not be reported as crisis principal, escrow balance or verified impact.
