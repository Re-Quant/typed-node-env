import {
  CommonEnvPropInfo,
  CommonEnvPropParams,
  ECastingType,
  EnvCtor,
  EnvCtorProto,
  EnvVarName,
  TypeCastingTransformer,
} from '../types';
import { utils } from '../utils';
import { getMetadataStorage } from '../metadata-storage'; // eslint-disable-line import/no-cycle

import { commonDefaultParams } from './common-default-params';

type EnvFloatParams = CommonEnvPropParams;

export type EnvFloatPropInfo = CommonEnvPropInfo<ECastingType.Float, EnvFloatParams>;

const defaultParams: EnvFloatParams = {
  ...commonDefaultParams,
};

export const transformer: TypeCastingTransformer<EnvFloatParams, number> = (raw) => {
  const value = +raw;

  if (Number.isNaN(value)) {
    throw new TypeError('An Float number expected, NaN is gotten');
  }

  return value;
};

export function EnvFloat(paramsOrName: EnvFloatParams | EnvVarName = {}): PropertyDecorator {
  const metadata = getMetadataStorage();
  const params = utils.normalizeParamsOrName(paramsOrName);

  return (target: EnvCtorProto, propertyKey: string | symbol): void => {
    const envPropInfo: EnvFloatPropInfo = {
      transformer,
      castType: ECastingType.Float,
      params: { ...defaultParams, ...params },
      isArray: utils.reflectIsArrayFlag(target, propertyKey, params.isArray),
    };
    const ctor = target.constructor as EnvCtor;
    metadata.setCtorEnvPropInfo(ctor, propertyKey, envPropInfo);
  };
}
