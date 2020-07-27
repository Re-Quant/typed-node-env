import {
  AnyEnum,
  CommonEnvPropInfo,
  CommonEnvPropParams,
  ECastingType,
  EnvCtor,
  EnvCtorProto,
  TypeCastingTransformer,
} from '../types';
import { utils } from '../utils';
import { getMetadataStorage } from '../metadata-storage'; // eslint-disable-line import/no-cycle

import { commonDefaultParams } from './common-default-params';

interface EnvEnumParams extends CommonEnvPropParams {
  readonly enum: AnyEnum;
}

export type EnvEnumPropInfo = CommonEnvPropInfo<ECastingType.Enum, EnvEnumParams>;

const defaultParams: Partial<EnvEnumParams> = {
  ...commonDefaultParams,
};

const enumValuesHashTable = new Map<AnyEnum, Set<string | number>>();
export const transformer: TypeCastingTransformer<EnvEnumParams, AnyEnum> = (raw, { enum: enumType }) => {
  if (!enumValuesHashTable.has(enumType)) {
    enumValuesHashTable.set(enumType, new Set(Object.values(enumType)));
  }
  const values = enumValuesHashTable.get(enumType)!;
  if (values.has(raw)) return raw as AnyEnum;

  throw new TypeError(`Can't cast to enum.
    Enum: ${ utils.stringifySimpleRawValue(enumType, Infinity) }`);
};

export function EnvEnum(paramsOrEnum: EnvEnumParams | AnyEnum): PropertyDecorator {
  const metadata = getMetadataStorage();
  const params = typeof paramsOrEnum.enum === 'object' ? paramsOrEnum as EnvEnumParams : { enum: paramsOrEnum };

  return (target: EnvCtorProto, propertyKey: string | symbol): void => {
    const envPropInfo: EnvEnumPropInfo = {
      transformer,
      castType: ECastingType.Enum,
      params: { ...defaultParams, ...params },
      isArray: utils.reflectIsArrayFlag(target, propertyKey),
    };
    const ctor = target.constructor as EnvCtor;
    metadata.setCtorEnvPropInfo(ctor, propertyKey, envPropInfo);
  };
}
