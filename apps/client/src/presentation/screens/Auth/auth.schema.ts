/**
 * Zod schemas for the OTP sign-in forms (RBT-020). Bahasa Indonesia messages
 * so React Hook Form surfaces them directly in the UI. Framework-free module
 * that the screen's resolvers consume.
 */
import { z } from "zod";

/** Email step: a single valid email address. */
export const emailSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email wajib diisi")
    .email("Format email tidak valid"),
});

/** Code step: exactly 6 digits. */
export const codeSchema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Kode OTP harus 6 digit angka"),
});

export type EmailForm = z.infer<typeof emailSchema>;
export type CodeForm = z.infer<typeof codeSchema>;
