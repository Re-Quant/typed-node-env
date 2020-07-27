import { EnvFloat, transformer } from './env-float.decorator';

describe(`${ EnvFloat.name }`, () => {
  describe('Valid cases', () => {
    it('".123" -> 0.123',     () => expect(transformer('.123', {})).toBe(0.123));
    it('"0.123" -> 0.123',    () => expect(transformer('0.123', {})).toBe(0.123));
    it('"0" -> 0',            () => expect(transformer('0', {})).toBe(0));
    it('"" (empty string)',   () => expect(transformer('', {})).toBe(0));
  });

  describe('Invalid cases: should throw a TypeError', () => {
    it('"asdf"', () => expect(() => transformer('asdf', {})).toThrowError(TypeError));
  });
});
