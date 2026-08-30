# Deployment Status Semantics

| State | Meaning |
| --- | --- |
| `LIVE` | Checked and usable in the current environment. |
| `DEGRADED` | Usable with a known limitation/fallback. |
| `DISABLED` | Implemented/configured boundary exists but execution is deliberately off. |
| `TBA` | Planned or awaiting deployment/configuration/audit. |
| `UNAVAILABLE` | Required provider/data/chain dependency cannot currently be used. |

Static marketing copy must not convert `DISABLED` or `TBA` into `LIVE`.
