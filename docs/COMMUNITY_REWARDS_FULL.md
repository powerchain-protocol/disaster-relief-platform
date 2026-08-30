# Community Rewards

PowerChain rewards are intended to recognize verified network contribution, not passive holding.

Reward reasons:

```text
VERIFIED_FIELD_EVIDENCE
VERIFIED_SUPPLIER_DELIVERY
VERIFIED_IMPACT
COMMUNITY_PARTICIPATION
VERIFIED_DATA_CONTRIBUTION
```

## Reward epoch

An epoch binds:

- epoch ID
- total budget
- distributed amount
- per-subject maximum
- per-organization maximum
- start/end timestamps
- policy version

## Recommendation checks

A recommendation is eligible for review only if:

- epoch/policy binding exists;
- epoch is active;
- subject exists;
- recommendation is verified;
- not duplicate;
- not challenged;
- evidence exists and contains no duplicate IDs;
- evidence was not previously rewarded;
- amount is positive;
- subject/org cumulative caps remain satisfied;
- epoch budget remains satisfied.

The helper always returns:

```text
automaticMint = false
authority = REWARD_POLICY_REVIEW
```

A recommendation is therefore not a mint authorization.
