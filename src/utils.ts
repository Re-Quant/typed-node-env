import 'reflect-metadata';

import { CommonEnvPropParams, EnvCtor, EnvCtorProto, EnvVarName, Type } from './types';

class TypedEnvUtils {

  public reflectIsArrayFlag(proto: EnvCtorProto, propertyKey: string | symbol): boolean {
    return Reflect.getMetadata('design:type', proto, propertyKey) === Array;
  }

  public reflectEnvCtorOnProperty(
    proto: EnvCtorProto,
    propertyKey: string | symbol,
    ctorFromParams: EnvCtor | undefined,
  ): EnvCtor | undefined {
    if (ctorFromParams !== undefined) return ctorFromParams;

    const propDto = Reflect.getMetadata('design:type', proto, propertyKey) as EnvCtor | unknown;
    if (typeof propDto === 'function' && propDto !== Object && propDto !== Function) return propDto as EnvCtor;
  }

  public stringifySimpleRawValue(raw: any, maxLength = 32): string {
    try {
      return String(JSON.stringify(raw, null, ' ')).slice(0, maxLength - 1);
    } catch (e) {
      return '(Can\'t stringify value)';
    }
  }

  public makeSimpleRawValueInfoStr(raw: any): string {
    return `Raw Value (${ typeof raw }): ${ this.stringifySimpleRawValue(raw) }`;
  }

  public screamingSnakeCase(strInCamelCase: string, prefixInCamelCase?: string): string {
    const str = strInCamelCase.replace(/(?<!(?:[A-Z_]|^))([A-Z])/g, '_$1').toUpperCase();
    return prefixInCamelCase !== undefined ? `${ this.screamingSnakeCase(prefixInCamelCase) }_${ str }` : str;
  }

  public normalizeParamsOrName<T extends CommonEnvPropParams>(paramsOrName: T | EnvVarName): T | CommonEnvPropParams {
    return typeof paramsOrName === 'string' || Array.isArray(paramsOrName) ? { name: paramsOrName } : paramsOrName;
  }

  public ctorAndPropStr(ctor: Type<any>, propertyKey: string | symbol): string {
    return `${ this.findCtorName(ctor) }.${ String(propertyKey) }`;
  }

  public findCtorName(ctor: EnvCtor): string {
    return ctor.name;
  }

}

export const utils = new TypedEnvUtils();
