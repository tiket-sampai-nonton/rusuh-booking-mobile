/**
 * LoginModal styles — extracted from the component (refactor rule: screens/
 * components carry no inline `style={{…}}` StyleSheet bodies). Mirrors the
 * prototype `.lg` / `.lg-actions` / `.go` / `.ghost` rules. Every color is a
 * TOKEN value (or a documented prototype accent), never a raw literal.
 */
import { tokens, withAlpha } from "@presentation/theme";

/** Modal scrim — prototype `#lgBack` rgba(5,5,7,.6) (deeper than --ink by design). */
export const SCRIM = "rgba(5,5,7,0.6)";
/** "Done" confirm CTA green — prototype `#16a34a` (distinct from the --ok token). */
export const DONE_GREEN = "#16a34a";

export const loginStyles = {
  title: {
    fontSize: tokens.fontSize["2xl"],
    fontWeight: tokens.fontWeight.extrabold,
    letterSpacing: -0.4,
    color: tokens.neutral.ink,
  },
  sub: {
    fontSize: tokens.fontSize.sm,
    color: tokens.neutral.muted,
    marginTop: 6,
    lineHeight: 20,
  },
  bold: { fontWeight: tokens.fontWeight.bold, color: tokens.neutral.ink },
  fld: { marginTop: 16 },
  label: {
    fontSize: tokens.fontSize.xs,
    fontWeight: tokens.fontWeight.bold,
    marginBottom: 6,
    color: tokens.neutral.ink,
  },
  input: {
    width: "100%" as const,
    fontSize: tokens.fontSize.md,
    fontWeight: tokens.fontWeight.semibold,
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: tokens.radius.md,
    borderWidth: 1.5,
    borderColor: tokens.neutral.line,
    backgroundColor: tokens.neutral.paper,
    color: tokens.neutral.ink,
    letterSpacing: 0.6,
  },
  err: {
    color: tokens.brand.red,
    fontSize: 11,
    marginTop: 6,
    minHeight: 14,
    fontWeight: tokens.fontWeight.semibold,
  },
  hint: {
    fontSize: 11,
    color: tokens.neutral.muted,
    marginTop: 8,
  },
  actions: { flexDirection: "row" as const, gap: 10, marginTop: 20 },
  ghost: {
    flexGrow: 0,
    flexShrink: 0,
    backgroundColor: withAlpha(tokens.neutral.ink, 0.05),
    borderWidth: 1,
    borderColor: tokens.neutral.line,
    borderRadius: tokens.radius.pill,
    paddingVertical: 13,
    paddingHorizontal: 18,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  ghostText: {
    color: tokens.neutral.ink,
    fontWeight: tokens.fontWeight.semibold,
    fontSize: tokens.fontSize.base,
  },
  go: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 9,
    backgroundColor: tokens.neutral.ink,
    borderRadius: tokens.radius.pill,
    paddingVertical: 13,
  },
  goText: {
    color: tokens.neutral.card,
    fontWeight: tokens.fontWeight.bold,
    fontSize: tokens.fontSize.base,
  },
  pin: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: tokens.brand.red,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  pinText: { color: tokens.neutral.card, fontSize: 12, fontWeight: tokens.fontWeight.bold },
  signedin: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    marginTop: 4,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: tokens.brand.ember,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  avatarText: {
    color: tokens.neutral.card,
    fontWeight: tokens.fontWeight.extrabold,
    fontSize: tokens.fontSize.xl,
  },
  signedName: {
    fontWeight: tokens.fontWeight.extrabold,
    fontSize: tokens.fontSize.md,
    color: tokens.neutral.ink,
  },
  signedEmail: { fontSize: tokens.fontSize.xs, color: tokens.neutral.muted },
  inputReadonly: {
    backgroundColor: withAlpha(tokens.neutral.ink, 0.04),
    color: tokens.neutral.muted,
  },
  consentRow: {
    flexDirection: "row" as const,
    alignItems: "flex-start" as const,
    gap: 10,
    marginTop: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: tokens.neutral.line,
    backgroundColor: tokens.neutral.paper,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginTop: 1,
  },
  checkboxChecked: {
    backgroundColor: tokens.neutral.ink,
    borderColor: tokens.neutral.ink,
  },
  checkboxMark: {
    color: tokens.neutral.card,
    fontSize: 13,
    fontWeight: tokens.fontWeight.bold,
  },
  consentText: {
    flex: 1,
    fontSize: tokens.fontSize.sm,
    color: tokens.neutral.muted,
    lineHeight: 19,
  },
  link: {
    color: tokens.brand.red,
    fontWeight: tokens.fontWeight.bold,
    textDecorationLine: "underline" as const,
  },
  doneCheck: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: DONE_GREEN,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginTop: 4,
  },
  doneCheckMark: {
    color: tokens.neutral.card,
    fontSize: 28,
    fontWeight: tokens.fontWeight.extrabold,
  },
};
