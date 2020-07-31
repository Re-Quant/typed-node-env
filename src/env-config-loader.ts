import { MetadataStorage } from './metadata-storage';
import { AnyObject, ECastingType, EnvCtor, EnvRawObject, EnvVarName, Type } from './types';
import { UEnvPropInfo } from './types/env-prop-info.union';
import { EnvPropConfigError, EnvVarNameDuplicateError, NoEnvVarError, TypeCastingError } from './errors';
import { utils } from './utils';
import { EnvNestedPropInfo } from './decorators/env-nested.decorator';

export class EnvConfigLoader {

  private readonly usedEnvVarNames
      = new Map<string, { ctor: EnvCtor; propertyKey: string | symbol; allowConflicts: boolean }>();

  public constructor(
      private readonly metadata: MetadataStorage,
      private readonly rawEnvObj: EnvRawObject,
  ) {}

  public load<T extends AnyObject>(EnvConfigCtor: Type<T>, prefix?: string): T {
    const ctorInfo = this.metadata.getEnvCtorInfo(EnvConfigCtor);

    const ins = new EnvConfigCtor();
    ctorInfo.propsInfo.forEach((propInfo, prop) => {
      const { envInfo } = propInfo;
      if (!envInfo) return;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
      (ins as any)[prop] = envInfo.castType === ECastingType.Nested
          ? this.loadNested(envInfo, prefix)
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          : this.loadProperty(EnvConfigCtor, prop, envInfo, (ins as any)[prop], prefix);
    });
    return Object.freeze(ins);
  }

  private loadNested(envInfo: EnvNestedPropInfo, prevPrefix?: string): AnyObject {
    let prefix = envInfo.params.prefix === false ? undefined : envInfo.params.prefix;
    if (prevPrefix) prefix = prefix ? `${ prevPrefix }_${ prefix }` : prevPrefix;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.load(envInfo.params.config, prefix);
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
      throw new EnvVarNameDuplicateError(ctor, propertyKey, duplicated, ctor2, propertyKey2);
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
             ? rawEnvVarValue.split(/(?<!\\),/g).map(v => envInfo.transformer(v.replace('\\,', ','), params as any))
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
