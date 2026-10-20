---
inclusion: always
---

# Development workflow (Superpowers style)

Use the Superpowers skills when they are available in your AI environment. If Kiro cannot invoke a named skill, follow the equivalent steps below; do not claim that a skill was run. Repository and user instructions take priority over this workflow.

1. **Start with context.** Read the relevant steering files, current code, and backend system documents for the feature. Check Git status before editing. Identify the user goal and any assumptions.
2. **Design before implementation.** For a small change, present a short design and get the user's agreement. For a new feature or architectural change, use `superpowers:brainstorming`: clarify the goal, compare approaches, and write a reviewed design in `docs/superpowers/specs/`. Then use `superpowers:writing-plans` to write checkable implementation steps in `docs/superpowers/plans/`.
3. **Implement in small steps.** Follow the approved plan. Use `superpowers:test-driven-development` for behavior changes: write a meaningful failing test, confirm the failure, implement the smallest change, and rerun the test. Keep platform-specific code in its source set and shared screens in Compose.
4. **Investigate failures.** Use `superpowers:systematic-debugging`: reproduce the issue, read the complete error, trace the cause, and verify the fix. Avoid speculative changes.
5. **Verify before reporting completion.** Use `superpowers:verification-before-completion`: run the relevant tests and builds, inspect their exit codes, review the diff, and report any unverified platform or remaining limitation. Request code review for substantive changes when available.
6. **Record the work.** Keep design, plan, and AI-use records in the repository. Make focused commits with clear messages; push or open a pull request when the user asks or the agreed delivery workflow calls for it.

For this repository, validate affected targets with the Gradle tasks in `README.md`; use Xcode for the iOS app. Preserve the payment-only web view boundary and the server-authoritative product rules throughout design and implementation.
