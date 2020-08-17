import { EnvNested, transformer } from './env-nested.decorator';

describe(`@${ EnvNested.name }() -> transform`, () => {
  it('Should just always throw an error', () => {
    expect(() => transformer(1, {})).toThrowError('never');
  });
});
