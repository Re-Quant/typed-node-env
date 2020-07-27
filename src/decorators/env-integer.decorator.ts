import {
  CommonEnvPropInfo,
  CommonEnvPropParams,
  ECastingType,
  EnvCtor,
  EnvCtorProto,
  EnvVarName,
  TypeCastingTransformer,
} from '../types';
import { getMetadataStorage } from '../metadata-storage'; // eslint-disable-line import/no-cycle
import { utils } from '../utils';

import { commonDefaultParams } from './common-default-params';

type EnvIntegerParams = CommonEnvPropParams;

export type EnvIntegerPropInfo = CommonEnvPropInfo<ECastingType.Integer, EnvIntegerParams>;

const defaultParams: EnvIntegerParams = {
  ...commonDefaultParams,
};

export const transformer: TypeCastingTransformer<EnvIntegerParams, number> = (raw) => {
  const value = +raw;

  if (Number.isNaN(value)) {
    throw new TypeError('An Integer number expected, NaN is gotten');
  }
  const integer = Math.trunc(value);
  if (value !== integer) {
    throw new TypeError('An Integer number expected, a Float is gotten');
  }

  return value;
};

export function EnvInteger(paramsOrName: EnvIntegerParams | EnvVarName = {}): PropertyDecorator {
  const metadata = getMetadataStorage();
  const params = utils.normalizeParamsOrName(paramsOrName);

  return (target: EnvCtorProto, propertyKey: string | symbol): void => {
    const envPropInfo: EnvIntegerPropInfo = {
      transformer,
      castType: ECastingType.Integer,
      params: { ...defaultParams, ...params },
      isArray: utils.reflectIsArrayFlag(target, propertyKey),
    };
    const ctor = target.constructor as EnvCtor;
    metadata.setCtorEnvPropInfo(ctor, propertyKey, envPropInfo);
  };
}
