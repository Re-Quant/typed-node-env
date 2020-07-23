import { Env } from './env.decorator';

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
});
