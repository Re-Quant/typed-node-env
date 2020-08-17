import 'reflect-metadata';

import { CommonEnvPropParams, EnvCtor, EnvCtorProto, EnvVarName, Type } from './types';
import { ENV_CONFIG_MAX_INHERITANCE_LIMIT, InternalEnvironmentClassFlag } from './constants';

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
    let currCtor: EnvCtor | undefined = ctor;

    let i: number = 0;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    while (currCtor && (currCtor as any)[InternalEnvironmentClassFlag] && i++ < ENV_CONFIG_MAX_INHERITANCE_LIMIT) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
      currCtor = Object.getPrototypeOf(currCtor.prototype).constructor;
    }

    return i >= ENV_CONFIG_MAX_INHERITANCE_LIMIT ? ctor.name : currCtor?.name || ctor.name;
  }

  public splitStringToArray(raw: string): string[] {
    const items = raw.split(/(?<!(?<!\\)\\),/g);

    return items.map((v, i) => {
      let item = v.replace(/\\,/g, ',');
      if (i + 1 < items.length) item = item.replace(/\\$/, '');
      return item;
    });
  }

  public reindent(strings: TemplateStringsArray, ...args: any[]): string {
    const raw = String.raw(strings, ...args);
    const space = ' '.repeat(4);
    const br = '\n';
    return raw.replace(/^ */mg, space).trim() + br;
  }

}

export const utils = new TypedEnvUtils();
