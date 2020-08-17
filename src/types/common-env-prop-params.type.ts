import { EnvVarName } from './ts-utils.type';

export interface CommonEnvPropParams {

  /** Default `false` */
  readonly optional?: boolean;

  /** Empty strings and strings filled with spaces only */
  readonly allowEmpty?: boolean;

  /** An environment variable name as is. Being calculated dynamically in case the param is omitted. */
  readonly name?: EnvVarName;

  /** Default `false`. Set `true` for both duplicates to suppress {@link EnvVarNameDuplicateError} */
  readonly allowConflictingVarName?: boolean;

  /**
   * In most cases you don't need to specify it manually.
   * The package detects arrays by type automatically. Examples: `string[]`, `number[]`
   * Specify this param only in case union types. Example: `string[] | number[]`, `LoggingConfig | boolean[]`
   * Notice: if you specify this param it has bigger priority then automatically detection.
   */
  readonly isArray?: boolean;
}
