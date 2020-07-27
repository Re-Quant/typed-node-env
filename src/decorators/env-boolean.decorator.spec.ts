import { EnvBoolean, transformer } from './env-boolean.decorator';

describe(`${ EnvBoolean.name } -> transformer`, () => {
  describe('Valid values: should return boolean', () => {
    it('"true"  -> true',  () => expect(transformer('true', {})).toBe(true));
    it('"false" -> false', () => expect(transformer('false', {})).toBe(false));
    it('"1"     -> true',  () => expect(transformer('1', {})).toBe(true));
    it('"0"     -> false', () => expect(transformer('0', {})).toBe(false));
  });

  describe('Invalid values: should throw TypeError', () => {
    it('"asdf"', () => expect(() => transformer('asdf', {})).toThrowError(TypeError));
    it('"1111"', () => expect(() => transformer('1111', {})).toThrowError(TypeError));
    it('"0000"', () => expect(() => transformer('0000', {})).toThrowError(TypeError));
    it('"" (empty string)',     () => expect(() => transformer('', {})).toThrowError(TypeError));
    it('"   " (space filled)',  () => expect(() => transformer('   ', {})).toThrowError(TypeError));
  });
});
