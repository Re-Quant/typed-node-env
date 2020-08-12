import { EnvBoolean, transformer } from './env-boolean.decorator';

describe(`${ EnvBoolean.name } -> transformer`, () => {
  describe('Valid values: should return boolean', () => {
    it('"1"     -> true',  () => expect(transformer('1', {})).toBe(true));
    it('"0"     -> false', () => expect(transformer('0', {})).toBe(false));

    it('"true"  -> true',  () => expect(transformer('true', {})).toBe(true));
    it('"false" -> false', () => expect(transformer('false', {})).toBe(false));
    it('"yes"   -> true',  () => expect(transformer('yes', {})).toBe(true));
    it('"no"    -> false', () => expect(transformer('no', {})).toBe(false));

    it('"TRUE"  -> true',  () => expect(transformer('TRUE', {})).toBe(true));
    it('"FALSE" -> false', () => expect(transformer('FALSE', {})).toBe(false));
    it('"YES"   -> true',  () => expect(transformer('YES', {})).toBe(true));
    it('"NO"    -> false', () => expect(transformer('NO', {})).toBe(false));

    it('"" (empty string)',     () => expect(transformer('', {})).toBe(false));
    it('"   " (space filled)',  () => expect(transformer('   ', {})).toBe(false));
  });

  describe('Invalid values: should throw TypeError', () => {
    it('"asdf"', () => expect(() => transformer('asdf', {})).toThrowError(TypeError));
    it('"1111"', () => expect(() => transformer('1111', {})).toThrowError(TypeError));
    it('"0000"', () => expect(() => transformer('0000', {})).toThrowError(TypeError));
  });
});
