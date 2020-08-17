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

const enumValuesHashTable = new Map<AnyEnum, { values: Set<string | number>; isNumeric: boolean }>();
export const transformer: TypeCastingTransformer<EnvEnumParams, AnyEnum> = (raw, { enum: enumType }) => {
  const ifEnumIsArray = enumType instanceof Array;

  if (!enumValuesHashTable.has(enumType)) {
    const enumValues = ifEnumIsArray ? enumType as any[] : Object.values(enumType);
    const isNumeric = enumValues.some(v => typeof v === 'number');
    enumValuesHashTable.set(enumType, { isNumeric, values: new Set<string | number>(enumValues) });
  }

  const { values, isNumeric } = enumValuesHashTable.get(enumType)!;
  const rawValue = isNumeric ? +raw : raw as string;

  if (values.has(rawValue)) return rawValue as any; // eslint-disable-line @typescript-eslint/no-unsafe-return

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
      isArray: utils.reflectIsArrayFlag(target, propertyKey, params.isArray),
    };
    const ctor = target.constructor as EnvCtor;
    metadata.setCtorEnvPropInfo(ctor, propertyKey, envPropInfo);
  };
}
