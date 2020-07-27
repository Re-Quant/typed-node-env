import { EnvInteger, transformer as t } from './env-integer.decorator';

describe(`${ EnvInteger.name }`, () => {
  describe('Valid numbers', () => {
    it('"0" -> 0',      () => expect(t('0', {})).toBe(0));
    it('"123" -> 123',  () => expect(t('123', {})).toBe(123));
    it('"0xFF" -> 255', () => expect(t('0xFF', {})).toBe(255));
    it('"0x111" -> 7',  () => expect(t('0b111', {})).toBe(7));
  });

  describe('Valid numbers wrapped with spaces', () => {
    it('" 0 " -> 0',      () => expect(t(' 0 ', {})).toBe(0));
    it('" 123 " -> 123',  () => expect(t(' 123 ', {})).toBe(123));
    it('" 0xFF " -> 255', () => expect(t(' 0xFF ', {})).toBe(255));
    it('" 0x111 " -> 7',  () => expect(t(' 0b111 ', {})).toBe(7));
  });

  describe('Zero-leading numbers', () => {
    it('"0111" -> Invalid Value',       () => expect(t('0111', {})).toBe(111));
    it('"000111" -> Invalid Value',     () => expect(t('000111', {})).toBe(111));
    it('"000" -> Invalid Value',        () => expect(t('000', {})).toBe(0));
  });

  describe('TypeError on float number', () => {
    it('"0.123" -> 0.123',    () => expect(() => t('0.123', {})).toThrow('Float is gotten'));
    it('".123" -> 0.123',     () => expect(() => t('.123', {})).toThrow('Float is gotten'));
    it('" 0.123 " -> 0.123',  () => expect(() => t(' 0.123 ', {})).toThrow('Float is gotten'));
    it('" .123 " -> 0.123',   () => expect(() => t(' .123 ', {})).toThrow('Float is gotten'));
  });

  describe('Should return 0 on empty string of space-filled only string', () => {
    it('"" -> undefined',  () => expect(t('', {})).toBe(0));
    it('" " -> undefined', () => expect(t(' ', {})).toBe(0));
  });

  describe('Should throw an error on any invalid value', () => {
    it('"asdf"', () => expect(() => t('asdf', {})).toThrowError('NaN'));
    it('"{}"',   () => expect(() => t('{}', {})).toThrowError('NaN'));
  });
});
