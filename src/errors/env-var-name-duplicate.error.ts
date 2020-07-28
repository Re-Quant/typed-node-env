import { EnvCtor } from '../types';
import { utils } from '../utils';

/**
 * It can be important to know explicitly about ENV Var name duplicates.
 *
 * To work with duplicates please specify it explicitly with adding ".allowConflictingVarName: true" flag to both field
 * definitions.
 */
export class EnvVarNameDuplicateError extends Error {
  public readonly name = 'EnvVarNameDuplicateError';

  public constructor(
      public readonly targetCtor: EnvCtor,
      public readonly propertyKey: string | symbol,
      public readonly envVarName: string,
      public readonly targetCtor2: EnvCtor,
      public readonly propertyKey2: string | symbol,
  ) {
    super(`ENV Var name "${ envVarName }" requested by "${ utils.ctorAndPropStr(targetCtor, propertyKey)
    }" being already used by "${ utils.ctorAndPropStr(targetCtor2, propertyKey2) }".
    If it is on purpose please add ".allowConflictingVarName: true" flag to both field definitions`);

    Object.setPrototypeOf(this, new.target.prototype); // Restoring prototype chain
  }
}
