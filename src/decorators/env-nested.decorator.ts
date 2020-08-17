import {
  CommonEnvPropInfo,
  CommonEnvPropParams,
  ECastingType,
  EnvCtor,
  EnvCtorProto,
  TypeCastingTransformer,
} from '../types';
import { getMetadataStorage } from '../metadata-storage'; // eslint-disable-line import/no-cycle
import { utils } from '../utils';
import { EnvPropDecorationError } from '../errors';

import { commonDefaultParams } from './common-default-params';

interface EnvNestedParams extends Omit<CommonEnvPropParams, 'name' | 'optional' | 'isArray'> {
  /**
   * Use this field to specify nested config prefixes manually.
   * By the default the Property Key transformed to uppercase + underscore used as the prefix.
   * Specify `false` to disable prefixing nested config.
   */
  readonly prefix?: string | false;

  /** By default it being reflected from the Property Key type definition, but you can specify it manually */
  readonly config?: EnvCtor;
}

interface EnvNestedInternalParams extends EnvNestedParams, CommonEnvPropParams {
  readonly prefix: string | false;
  readonly config: EnvCtor;
}

export type EnvNestedPropInfo = CommonEnvPropInfo<ECastingType.Nested, EnvNestedInternalParams>

const defaultParams: Partial<EnvNestedInternalParams> = {
  ...commonDefaultParams,
};

export const transformer: TypeCastingTransformer<EnvNestedParams, never> = () => {
  throw new Error('Transformer Fn for ECastingType.Nested should be never executed, but it is executed');
};

export function EnvNested(paramsOrPrefix: EnvNestedParams | EnvNestedParams['prefix'] = {}): PropertyDecorator {
  const metadata = getMetadataStorage();
  const params = typeof paramsOrPrefix === 'object' ? paramsOrPrefix : { prefix: paramsOrPrefix };

  return (target: EnvCtorProto, propertyKey: string | symbol): void => {
    const ctor = target.constructor as EnvCtor;

    let { prefix } = params;
    if (prefix === undefined) prefix = typeof propertyKey === 'string' ? propertyKey : false;
    if (typeof prefix === 'string' && !prefix.trim().length) prefix = false;

    const config = utils.reflectEnvCtorOnProperty(target, propertyKey, params.config);
    if (!config) {
      const msg = 'Can\'t find a nested config constructor either from property type or from decorator params.';
      throw new EnvPropDecorationError(ctor, propertyKey, EnvNested, msg);
    }

    const envPropInfo: EnvNestedPropInfo = {
      transformer,
      castType: ECastingType.Nested,
      params: { ...defaultParams, ...params, config, prefix },
      isArray: false,
    };
    metadata.setCtorEnvPropInfo(ctor, propertyKey, envPropInfo);
  };
}
