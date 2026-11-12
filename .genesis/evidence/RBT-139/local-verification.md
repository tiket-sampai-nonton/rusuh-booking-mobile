# RBT-139 Sonar remediation — local verification

Date: 2026-11-12

## Baseline

The full SonarCloud report for PR #194 (`develop` → `main`) is archived in
[`sonar-pr194-report.md`](./sonar-pr194-report.md) and
[`sonar-pr194-issues.json`](./sonar-pr194-issues.json). The baseline contained
201 unresolved findings (3 bugs, 198 code smells, 0 vulnerabilities). Its gate
failed on reliability rating 3 (maximum 1) and new-code coverage 78.0% (minimum
80%).

## Remediation

The changes address the reported defects and maintainability findings across
domain rules, HTTP adapters, presentation screens/components, and tests. The
work also adds assertions and focused coverage for affected behavior. No
runtime dependencies or BE contracts were changed.

## Local gates

| Gate | Result |
|---|---|
| TypeScript strict typecheck | Pass |
| ESLint | Pass — 0 errors, 31 warnings |
| Prettier format check | Pass |
| OTA fingerprint verification | Pass |
| Production dependency audit (`--audit-level=high`) | Pass (exit 0; audit reports 21 low/moderate advisories, no high/critical gate failure) |
| Jest coverage | Pass — 196 suites, 1,206 tests |
| Web static export | Pass — 49 routes exported |
| `git diff --check` | Pass |

Overall local coverage from the completed Jest run: 92.84% lines, 91.68%
statements, 83.53% branches, and 91.28% functions.

## SonarCloud status

This file records local checks only. The hosted SonarCloud result is tracked on
GitHub PR #194; its live check and comments are authoritative for the current
promotion head.
