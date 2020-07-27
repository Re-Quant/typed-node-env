import { ECastingType } from './casting-type.enum';
import { CommonEnvPropParams } from './common-env-prop-params.type';
import { TypeCastingTransformer } from './type-casting-transformer.type';

export interface CommonEnvPropInfo<
    TType extends ECastingType[keyof ECastingType],
    TParams extends CommonEnvPropParams,
> {
  readonly castType: TType;

  readonly isArray: boolean;

  readonly params: TParams;
  readonly transformer: TypeCastingTransformer<TParams>;
}
