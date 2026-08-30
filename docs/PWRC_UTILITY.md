# PWRC Utility Architecture

PWRC is modeled as PowerChain network utility, not as crisis donor capital or treasury authority.

## Utility categories

```text
ACCESS
COMPUTE
SERVICES
PARTICIPATION
GOVERNANCE
INCENTIVES
REPUTATION
NETWORK
```

## Power Units

Reference conversion:

```text
10 PWRC = 1 Power Unit
```

The conversion is a service-metering abstraction and may be configured independently from token decimals.

Reference service prices in the shared package include:

| Service | Power Units | PWRC |
| --- | ---: | ---: |
| Crisis Analysis | 500 | 5,000 |
| Risk Analysis | 250 | 2,500 |
| Procurement Analysis | 750 | 7,500 |
| Impact Report | 1,000 | 10,000 |

## Utility tiers

| Tier | Power Units threshold |
| --- | ---: |
| Explorer | < 1,000 |
| Contributor | >= 1,000 |
| Operator | >= 50,000 |
| Professional | >= 500,000 |
| Enterprise | >= 5,000,000 |

These are utility/service tiers, not RBAC roles.

## Financial authority separation

```text
PWRC balance
  != treasury access
  != escrow release
  != procurement authority
  != emergency authority
```

The policy package enforces that PWRC balance alone never authorizes financial actions.

## Crisis capital

USDC/SOL and other configured settlement assets remain separate from PWRC utility. The UI and documentation should explain this distinction anywhere a user could confuse utility payment with emergency funding.
