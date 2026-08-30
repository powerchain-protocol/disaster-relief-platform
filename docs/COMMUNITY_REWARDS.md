> See the complete documentation index in [`docs/README.md`](README.md).

# Community Reward System v1.0.0 Roadmap

## Objective

Reward useful, verifiable network participation rather than passive token holding.

Eligible categories can include:

- verified field evidence;
- verified supplier delivery;
- verified impact milestones;
- approved community operations;
- verified data or infrastructure contributions.

## Epoch model

Each reward epoch defines:

```text
epochId
budgetAtomic
startsAt
endsAt
eligibilityPolicyVersion
maxPerSubjectAtomic
maxPerOrganizationAtomic
reviewThresholdAtomic
```

Recommendations cannot exceed the remaining epoch budget.

## Anti-gaming

- evidence IDs are required;
- duplicate/replay checks;
- related-party/conflict review;
- quality threshold;
- per-subject caps;
- anomaly monitoring;
- challenge/reversal procedure;
- audit trail.

Reward eligibility does not grant operational authority or improve trust status automatically.
