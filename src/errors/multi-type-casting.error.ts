import { ECastingType, EnvCtor } from '../types';
import { utils } from '../utils';
import { TypeCastingError } from './type-casting.error';

export class MultiTypeCastingError extends Error {
  public readonly name = 'MultiTypeCastingError';

  public constructor(
      public readonly targetCtor: EnvCtor,
      public readonly propertyKey: string | symbol,
      public readonly errorsEntities: [ECastingType, Error | TypeCastingError][],
      public readonly simpleMessage: string,
  ) {
    super(utils.reindent`${ utils.ctorAndPropStr(targetCtor, propertyKey) }: ${ simpleMessage }.
      ${ errorsEntities.map(([type, e]) => `For ${ type.toUpperCase() }: ${ e.message }`).join(',\n') }
    `);

    Object.setPrototypeOf(this, new.target.prototype); // Restoring prototype chain
  }
}
