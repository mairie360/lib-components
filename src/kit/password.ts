/**
 * MAIR-837, MAIR-757: the Mairie360 password rule, shared by every front where an agent chooses a password
 * (Login first connection and reset, Settings, Administration). Core API applies the CNIL 2022 policy: at least
 * 12 characters, no commonly used password, nothing from the account's e-mail, first name or last name, and no
 * character-class rule. The front can only check the length; Core API checks the rest.
 */
export const NEW_PASSWORD_MIN_LENGTH = 12;
/** Error message shown when the new password is too short. */
export const NEW_PASSWORD_RULE_MESSAGE = 'Utilisez au moins 12 caractères.';
/** Help text of the « nouveau mot de passe » field (Figma `Field/Password`, `Field/NewPassword`): the whole policy. */
export const NEW_PASSWORD_HINT = '12 caractères minimum. Évitez les mots de passe courants, votre e-mail, votre prénom et votre nom.';

/** Returns the error message, or `null` when the value is long enough. Length counts characters, not UTF-16 units. */
export function checkNewPassword(value: string): string | null {
  return Array.from(value ?? '').length >= NEW_PASSWORD_MIN_LENGTH ? null : NEW_PASSWORD_RULE_MESSAGE;
}
