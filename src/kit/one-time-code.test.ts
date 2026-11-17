import { normalizeRecoveryCode, normalizeTotpCode } from './one-time-code';

// MAIR-1067: the two code formats of the two-factor screens.
describe('MAIR-1067 one-time code normalisation', () => {
  it.each([
    ['123456', '123456'],
    ['123 456', '123456'],
    ['123-456', '123456'],
    ['12a3b4', '1234'],
    ['1234567890', '123456'],
    ['', ''],
  ])('TOTP %j becomes %j', (typed, expected) => expect(normalizeTotpCode(typed)).toBe(expected));

  it.each([
    ['a1b2c3d4', 'A1B2-C3D4'],
    ['A1B2-C3D4', 'A1B2-C3D4'],
    ['a1b2 c3d4', 'A1B2-C3D4'],
    ['a1b2', 'A1B2'],
    ['a1b2c', 'A1B2-C'],
    ['a1b2c3d4e5', 'A1B2-C3D4'],
    ['  ', ''],
  ])('recovery %j becomes %j', (typed, expected) => expect(normalizeRecoveryCode(typed)).toBe(expected));

  it('is idempotent', () => {
    expect(normalizeRecoveryCode(normalizeRecoveryCode('a1b2c3d4'))).toBe('A1B2-C3D4');
    expect(normalizeTotpCode(normalizeTotpCode('123 456'))).toBe('123456');
  });
});
