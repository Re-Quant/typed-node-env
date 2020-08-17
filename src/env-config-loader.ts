import { MetadataStorage } from './metadata-storage';
import { AnyObject, ECastingType, EnvCtor, EnvCtorProto, EnvRawObject, EnvVarName, Type } from './types';
import { UEnvPropInfo } from './types/env-prop-info.union';
import {
  EnvPropConfigError,
  EnvVarNameDuplicateError,
  MultiTypeCastingError,
  NoEnvVarError,
  TypeCastingError,
} from './errors';
import { utils } from './utils';
import { EnvNestedPropInfo } from './decorators/env-nested.decorator';
import { ENV_CONFIG_MAX_INHERITANCE_LIMIT } from './constants';

export class EnvConfigLoader {

  private readonly usedEnvVarNames
      = new Map<string, { ctor: EnvCtor; propertyKey: string | symbol; allowConflicts: boolean }>();

  public constructor(
      private readonly metadata: MetadataStorage,
      private readonly rawEnvObj: EnvRawObject,
  ) {}

  public load<T extends AnyObject>(EnvConfigCtorOnInstance: Type<T> | T, prefix?: string): T {
    const isCtor = typeof EnvConfigCtorOnInstance === 'function';

    const EnvConfigCtor = isCtor ? EnvConfigCtorOnInstance as Type<T> : EnvConfigCtorOnInstance.constructor as Type<T>;
    const ins = isCtor ? new EnvConfigCtor() : EnvConfigCtorOnInstance as T;

    let CurrentEnvCtor: EnvCtor | undefined = EnvConfigCtor;
    let i: number;
    for (i = 0; i < ENV_CONFIG_MAX_INHERITANCE_LIMIT && CurrentEnvCtor; i++) {
      const ctorInfo = this.metadata.getEnvCtorInfo(CurrentEnvCtor);
      ctorInfo.propsInfo.forEach((propInfo, prop) => {
        const { envInfo } = propInfo;
        if (!envInfo) return;
        /* eslint-disable @typescript-eslint/no-unsafe-member-access */
        (ins as any)[prop] // eslint-disable-line @typescript-eslint/no-unsafe-assignment
            = Array.isArray(envInfo) ? this.loadMultiple(EnvConfigCtor, prop, envInfo, (ins as any)[prop], prefix) :
              envInfo.castType === ECastingType.Nested ? this.loadNested(envInfo, prefix) :
              this.loadProperty(EnvConfigCtor, prop, envInfo, (ins as any)[prop], prefix);
        /* eslint-enable @typescript-eslint/no-unsafe-member-access */
      });

      // Looking for the parent to handle Env Constructors inheritance
      const parentPrototype: EnvCtorProto | undefined
          = CurrentEnvCtor.prototype && Object.getPrototypeOf(CurrentEnvCtor.prototype) as EnvCtorProto | undefined;
      CurrentEnvCtor
          = typeof parentPrototype?.constructor === 'function' ? parentPrototype.constructor as EnvCtor : undefined;
    }
    if (i >= ENV_CONFIG_MAX_INHERITANCE_LIMIT) {
      const name = CurrentEnvCtor ? utils.findCtorName(CurrentEnvCtor) : '(Unknown Constructor)';
      throw new RangeError(`${ name } ENV_CONFIG_MAX_INHERITANCE_LIMIT: ${ ENV_CONFIG_MAX_INHERITANCE_LIMIT } reached`);
    }
    return Object.freeze(ins);
  }

  private loadNested(envInfo: EnvNestedPropInfo, prevPrefix?: string): AnyObject {
    let prefix = envInfo.params.prefix === false ? undefined : envInfo.params.prefix;
    if (prevPrefix) prefix = prefix ? `${ prevPrefix }_${ prefix }` : prevPrefix;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.load(envInfo.params.config, prefix);
  }

  private loadMultiple(
    ctor: EnvCtor,
    propertyKey: string | symbol,
    envInfos: UEnvPropInfo[],
    propDefaultValue: any,
    prefix?: string,
  ): any {
    const errors = new Map<ECastingType, Error & { previous?: Error; raw?: unknown }>();
    let result: undefined | unknown;

    const found = envInfos.some((envInfo) => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        result = envInfo.castType === ECastingType.Nested
                 ? this.loadNested(envInfo, prefix)
                 : this.loadProperty(ctor, propertyKey, envInfo, propDefaultValue, prefix);
        return true;
      } catch (e) {
        errors.set(envInfo.castType, e);
      }
      return false;
    });

    if (found) return result;

    throw new MultiTypeCastingError(ctor, propertyKey, Array.from(errors.entries()), 'No acceptable value for multi-type field');
  }

  private loadProperty(
    ctor: EnvCtor,
    propertyKey: string | symbol,
    envInfo: UEnvPropInfo,
    propDefaultValue: any,
    prefix?: string,
  ): any {
    const { params } = envInfo;

    if (Array.isArray(params.name) && new Set(params.name).size !== params.name.length) {
      const msg = `Custom names array contains duplicates: ${ params.name.map(v => `"${ v }"`).join(', ') }`;
      throw new EnvPropConfigError(ctor, propertyKey, msg);
    }
    const envVarNames = this.makeEnvVarNames(ctor, propertyKey, params.name, prefix);
    const duplicated = envVarNames.find(name => this.usedEnvVarNames.has(name));
    if (duplicated && !params.allowConflictingVarName) {
      const { ctor: ctor2, propertyKey: propertyKey2 } = this.usedEnvVarNames.get(duplicated)!;
      if (ctor !== ctor2 || propertyKey !== propertyKey2) {
        throw new EnvVarNameDuplicateError(ctor, propertyKey, duplicated, ctor2, propertyKey2);
      }
    }
    envVarNames.forEach(name => this.usedEnvVarNames.set(
      name,
      { ctor, propertyKey, allowConflicts: !!params.allowConflictingVarName },
    ));

    const existsEnvVars = envVarNames.filter(v => this.rawEnvObj[v] !== undefined);
    const nameOfTheFirstNotEmptyEnvVar = params.allowEmpty
        ? existsEnvVars[0]
        : existsEnvVars.find(v => String(this.rawEnvObj[v] || '').trim().length);
    const rawEnvVarValue = nameOfTheFirstNotEmptyEnvVar !== undefined
                           ? this.rawEnvObj[nameOfTheFirstNotEmptyEnvVar]
                           : undefined;

    if (rawEnvVarValue === undefined) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      if (propDefaultValue !== undefined) return propDefaultValue;
      if (params.optional) return envInfo.isArray ? [] : undefined;

      throw new NoEnvVarError(ctor, propertyKey, envVarNames);
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return envInfo.isArray
             // eslint-disable-next-line @typescript-eslint/no-unsafe-return
             ? utils.splitStringToArray(rawEnvVarValue).map(v => envInfo.transformer(v, params as any))
             : envInfo.transformer(rawEnvVarValue, params as any);
    } catch (e) {
      throw new TypeCastingError(ctor, propertyKey, e, rawEnvVarValue, {
        'Env Var Name': `"${ String(nameOfTheFirstNotEmptyEnvVar) }"`,
        'Is Array': envInfo.isArray,
      });
    }
  }

  private makeEnvVarNames(
    ctor: EnvCtor,
    propertyKey: string | symbol,
    nameFromParams?: string | string[],
    prefix?: string,
  ): Exclude<EnvVarName, string> {
    /** ENV variable name in any notation */
    let envVarNameRaw = nameFromParams;
    if (!envVarNameRaw || Array.isArray(envVarNameRaw) && !envVarNameRaw.length) {
      if (typeof propertyKey === 'symbol') {
        const msg = 'A custom name has to be specified in case the field defined using a symbol';
        throw new EnvPropConfigError(ctor, propertyKey, msg);
      }
      envVarNameRaw = propertyKey;
    }
    if (!Array.isArray(envVarNameRaw)) envVarNameRaw = [envVarNameRaw];

    const rawPrefixed = prefix ? envVarNameRaw.map(v => `${ prefix }_${ v }`) : envVarNameRaw;
    const envVarNames = rawPrefixed.map(v => utils.screamingSnakeCase(v));

    return envVarNames as Exclude<EnvVarName, string>;
  }

}
