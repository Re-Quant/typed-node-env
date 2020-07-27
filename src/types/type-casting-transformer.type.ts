import { CommonEnvPropParams } from './common-env-prop-params.type';
import { AnyObject, EmptyObject } from './ts-utils.type';

export type TypeCastingTransformer<
  TParams extends AnyObject = EmptyObject,
  R = any,
> = (raw: any, params: Omit<TParams, keyof CommonEnvPropParams>) => R;
