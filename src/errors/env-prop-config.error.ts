import { EnvCtor } from '../types';
import { utils } from '../utils';

// TODO: test multiple equal names
export class EnvPropConfigError extends Error {
  public readonly name = 'EnvPropConfigError';

  public constructor(
      public readonly targetCtor: EnvCtor,
      public readonly propertyKey: string | symbol,
      message: string,
  ) {
    super(`${ utils.ctorAndPropStr(targetCtor, propertyKey) }: ${ message }`);

    Object.setPrototypeOf(this, new.target.prototype); // Restoring prototype chain
  }
}
