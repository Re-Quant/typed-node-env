import {
  CommonEnvPropInfo,
  CommonEnvPropParams,
  ECastingType,
  EnvCtor,
  EnvCtorProto, EnvVarName,
  TypeCastingTransformer,
} from '../types';
import { utils } from '../utils';
import { getMetadataStorage } from '../metadata-storage'; // eslint-disable-line import/no-cycle

import { commonDefaultParams } from './common-default-params';

type EnvStringParams = CommonEnvPropParams;

export type EnvStringPropInfo = CommonEnvPropInfo<ECastingType.String, EnvStringParams>;

const defaultParams: EnvStringParams = {
  ...commonDefaultParams,
};

export const transformer: TypeCastingTransformer<EnvStringParams, string> = raw => String(raw);

export function EnvString(paramsOrName: EnvStringParams | EnvVarName = {}): PropertyDecorator {
  const metadata = getMetadataStorage();
  const params = utils.normalizeParamsOrName(paramsOrName);

  return (target: EnvCtorProto, propertyKey: string | symbol): void => {
    const envPropInfo: EnvStringPropInfo = {
      transformer,
      castType: ECastingType.String,
      params: { ...defaultParams, ...params },
      isArray: utils.reflectIsArrayFlag(target, propertyKey),
    };
    const ctor = target.constructor as EnvCtor;
    metadata.setCtorEnvPropInfo(ctor, propertyKey, envPropInfo);
  };
}
