# SonarCloud remediation scan — PR #194

Date: 2026-11-12

After the first Sonar remediation was merged to `develop`, the hosted scan on
PR #194 passed its quality gate. Sonar reported 145 new issues, so the green
gate alone did not mean the report was clear. The remaining findings were:

| Rule | Count | Summary |
|---|---:|---|
| `typescript:S6767` | 135 | Props declared but not used by extracted components |
| `typescript:S7758` | 3 | Prefer Unicode code-point APIs |
| `typescript:S4323` | 2 | Extract repeated union types into aliases |
| `typescript:S6606` | 2 | Prefer nullish coalescing |
| `typescript:S6582` | 1 | Prefer optional chaining |
| `typescript:S3776` | 1 | Reduce composition-root cognitive complexity |
| `typescript:S4144` | 1 | Remove identical style helper implementation |

The complete 145-issue API response is archived in
[`sonar-pr194-residual-issues.json`](./sonar-pr194-residual-issues.json).
Sonar's PR comment reported 83.1% new-code coverage, 0.3% duplication, and no
security hotspots.

The follow-up changes narrow extracted component prop contracts, extract the
remaining repeated types, simplify the composition root, and apply the reported
API/style fixes. The next scan on PR #194 is the final hosted verification for
these changes.
