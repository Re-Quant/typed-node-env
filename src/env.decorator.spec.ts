import { Env, transformMap } from './env.decorator';

describe(`@${ Env.name }() decorator`, () => {
  it(`${ Env.name } decorator without custom name added to a field defined via a symbol
    THEN: Should throw an error that it is impossible to find ENV variable name`, () => {
    const someKey = Symbol('Some Key');
    const cb = () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      class User {
        @Env()
        public [someKey]!: string;
      }
    };
    expect(cb).toThrowError('Can\'t find ENV variable name.');
  });

  describe('transformMap testing', () => {
    describe('.boolean transformer', () => {
      const { boolean: bool } = transformMap;

      describe('Valid values: should return boolean', () => {
        it('"true"  -> true',  () => expect(bool('true')).toBe(true));
        it('"false" -> false', () => expect(bool('false')).toBe(false));
        it('"1"     -> true',  () => expect(bool('1')).toBe(true));
        it('"0"     -> false', () => expect(bool('0')).toBe(false));
      });

      describe('Invalid values: should return undefined', () => {
        it('"asdf" -> undefined', () => expect(bool('asdf')).toBe(undefined));
        it('"1111" -> undefined', () => expect(bool('1111')).toBe(undefined));
        it('"0000" -> undefined', () => expect(bool('0000')).toBe(undefined));
      });
    });
  });

});
