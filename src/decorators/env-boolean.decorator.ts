import {
  CommonEnvPropInfo,
  CommonEnvPropParams,
  Dictionary,
  ECastingType,
  EnvCtor,
  EnvCtorProto,
  EnvVarName,
  TypeCastingTransformer,
} from '../types';
import { getMetadataStorage } from '../metadata-storage'; // eslint-disable-line import/no-cycle
import { utils } from '../utils';

import { commonDefaultParams } from './common-default-params';

type EnvBooleanParams = CommonEnvPropParams;

export type EnvBooleanPropInfo = CommonEnvPropInfo<ECastingType.Boolean, EnvBooleanParams>;

const defaultParams: EnvBooleanParams = {
  ...commonDefaultParams,
};

const booleanValuesMap: Dictionary<boolean> = {
  true:  true,
  false: false,
  yes:  true,
  no: false,
  1: true,
  0: false,
};

export const transformer: TypeCastingTransformer<EnvBooleanParams, boolean> = (raw) => {
  const value = booleanValuesMap[String(raw).toLowerCase()];
  if (value !== undefined) return value;
  if (!String(raw).trim().length) return false;

  throw new TypeError('Boolean-like value expected, something else is gotten');
};

export function EnvBoolean(paramsOrName: EnvBooleanParams | EnvVarName = {}): PropertyDecorator {
  const metadata = getMetadataStorage();
  const params = utils.normalizeParamsOrName(paramsOrName);

  return (target: EnvCtorProto, propertyKey: string | symbol): void => {
    const envPropInfo: EnvBooleanPropInfo = {
      transformer,
      castType: ECastingType.Boolean,
      params: { ...defaultParams, ...params },
      isArray: utils.reflectIsArrayFlag(target, propertyKey),
    };
    const ctor = target.constructor as EnvCtor;
    metadata.setCtorEnvPropInfo(ctor, propertyKey, envPropInfo);
  };
}
