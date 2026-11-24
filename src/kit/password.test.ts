import { checkNewPassword, NEW_PASSWORD_HINT, NEW_PASSWORD_MIN_LENGTH, NEW_PASSWORD_RULE_MESSAGE } from './password';

// MAIR-837, MAIR-757: 12 characters minimum, no character-class rule (Core API's CNIL 2022 policy).
describe('checkNewPassword', () => {
  it.each([
    ['abcdefghijk1', null],
    ['1234567890ab', null],
    ['Élodie2026!!', null],
    ['abcdefghij1', NEW_PASSWORD_RULE_MESSAGE],
    // MAIR-757: Core API has no character-class rule (it refuses common passwords such as this one itself).
    ['abcdefghijkl', null],
    ['123456789012', null],
    ['', NEW_PASSWORD_RULE_MESSAGE],
  ])('%s → %s', (value, expected) => {
    expect(checkNewPassword(value)).toBe(expected);
  });

  it('counts characters rather than UTF-16 units and exposes the shared texts', () => {
    expect(checkNewPassword('😀😀😀😀😀a1234')).toBe(NEW_PASSWORD_RULE_MESSAGE);
    expect(checkNewPassword('😀😀😀😀😀😀a12345')).toBeNull();
    expect(NEW_PASSWORD_MIN_LENGTH).toBe(12);
    expect(NEW_PASSWORD_HINT).toBe('12 caractères minimum. Évitez les mots de passe courants, votre e-mail, votre prénom et votre nom.');
  });
});
