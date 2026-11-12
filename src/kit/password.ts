/**
 * MAIR-837: the Mairie360 password rule, shared by every front where an agent chooses a password
 * (Login first connection and reset, Settings, Administration) and mirrored by the API (MAIR-757):
 * at least 12 characters, with at least one digit and one letter.
 */
export const NEW_PASSWORD_MIN_LENGTH = 12;
/** Error message shown when the new password breaks the rule. */
export const NEW_PASSWORD_RULE_MESSAGE = 'Utilisez au moins 12 caractères, avec des chiffres et des lettres.';
/** Help text of the « nouveau mot de passe » field (Figma `Field/Password`, `Field/NewPassword`). */
export const NEW_PASSWORD_HINT = '12 caractères minimum, avec chiffres et lettres.';

/** Returns the error message, or `null` when the value follows the rule. Length counts characters, not UTF-16 units. */
export function checkNewPassword(value: string): string | null {
  const characters = Array.from(value ?? '');
  const valid = characters.length >= NEW_PASSWORD_MIN_LENGTH && /\p{Nd}/u.test(value) && /\p{L}/u.test(value);
  return valid ? null : NEW_PASSWORD_RULE_MESSAGE;
}
