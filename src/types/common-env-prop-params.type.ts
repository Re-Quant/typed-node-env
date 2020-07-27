import { EnvVarName } from './ts-utils.type';

export interface CommonEnvPropParams {

  /** default `false` */
  readonly optional?: boolean;

  /** Empty strings and strings filled with spaces only */
  readonly allowEmpty?: boolean;

  /** An environment variable name as is. Being calculated dynamically in case the param is omitted. */
  readonly name?: EnvVarName;
}
