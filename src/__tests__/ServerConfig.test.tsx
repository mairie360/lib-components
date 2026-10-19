/** @jest-environment node */
import { serviceBase, publicOrigin } from '../server/config';

it.each([
  [undefined, '', undefined], ['', '', undefined], ['bad URL', '', undefined], ['file:///etc/passwd', '', undefined],
  ['https://name:secret@api.test', '', undefined], ['https://api.test/path?token=value', '', undefined], ['https://api.test/path#private', '', undefined],
  ['  https://api.mairie.test/base///  ', 'https://api.mairie.test/base', 'https://api.mairie.test'],
  ['http://localhost:8080/', 'http://localhost:8080', 'http://localhost:8080'],
])('validates configured services and derives the public origin from %s', (input, base, origin) => {
  expect(serviceBase(input)).toBe(base); expect(publicOrigin(input)).toBe(origin);
});
