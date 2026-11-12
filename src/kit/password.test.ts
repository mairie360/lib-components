import { checkNewPassword, NEW_PASSWORD_HINT, NEW_PASSWORD_MIN_LENGTH, NEW_PASSWORD_RULE_MESSAGE } from './password';

// MAIR-837: 12 characters minimum, with digits and letters.
describe('checkNewPassword', () => {
  it.each([
    ['abcdefghijk1', null],
    ['1234567890ab', null],
    ['Élodie2026!!', null],
    ['abcdefghij1', NEW_PASSWORD_RULE_MESSAGE],
    ['abcdefghijkl', NEW_PASSWORD_RULE_MESSAGE],
    ['123456789012', NEW_PASSWORD_RULE_MESSAGE],
    ['', NEW_PASSWORD_RULE_MESSAGE],
  ])('%s → %s', (value, expected) => {
    expect(checkNewPassword(value)).toBe(expected);
  });

  it('counts characters rather than UTF-16 units and exposes the shared texts', () => {
    expect(checkNewPassword('😀😀😀😀😀a1234')).toBe(NEW_PASSWORD_RULE_MESSAGE);
    expect(NEW_PASSWORD_MIN_LENGTH).toBe(12);
    expect(NEW_PASSWORD_HINT).toBe('12 caractères minimum, avec chiffres et lettres.');
  });
});
