import { EnvCtor } from '../types';
import { utils } from '../utils';

export class NoEnvVarError extends Error {
  public readonly name = 'NoEnvVarError';

  public constructor(
      public readonly targetCtor: EnvCtor,
      public readonly propertyKey: string | symbol,
      public readonly names: [string, ...string[]],
  ) {
    super(`${
        names.length === 1 ? `Variable "${ names[0] }" is required`
                           : `One of ${ names.map(v => `"${ v }"`).join(', ') } variables should be specified`
    } for ${ utils.ctorAndPropStr(targetCtor, propertyKey) }`);

    Object.setPrototypeOf(this, new.target.prototype); // Restoring prototype chain
  }
}
