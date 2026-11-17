/** Length of a TOTP code (authenticator app). */
export const TOTP_CODE_LENGTH = 6;

/** MAIR-1067: keeps the digits of what the user typed or pasted (« 123 456 », « 123-456 ») and stops at six. */
export function normalizeTotpCode(value: string): string {
  return value.replace(/\D/g, '').slice(0, TOTP_CODE_LENGTH);
}

/**
 * MAIR-1067: a recovery code is shown as `A1B2-C3D4`: uppercase letters and digits, a dash after the fourth
 * character. Accepts what the user typed or pasted with spaces, lowercase or no dash, and stops at eight
 * characters. A trailing dash is never added, so the user can delete back through it.
 */
export function normalizeRecoveryCode(value: string): string {
  const compact = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
  return compact.length > 4 ? `${compact.slice(0, 4)}-${compact.slice(4)}` : compact;
}
