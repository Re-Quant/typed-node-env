import { AnyFn, AnyObject } from './ts-utils.type';
import Dict = NodeJS.Dict;// eslint-disable-line import/order

export type ValueType = string | boolean | number | undefined;

export type PropertyType = 'string' | 'number' | 'boolean';
export interface Options {
  readonly type?: PropertyType;
  readonly required?: boolean;
}

export type Param1 = string | ReadonlyArray<string> | Options | undefined;

export interface PropertyMeta extends Options {
  readonly envVarName: ReadonlyArray<string>;

  transform(value: string): ValueType;
}

export interface LoadPropertyMeta {
  configType: new () => any;
}

const booleanValuesMap: Dict<boolean> = {
  true:  true,
  false: false,
  1: true,
  0: false,
};
export const transformMap = {
  string: (value: string): string => value,
  number: parseFloat,
  boolean: (value: keyof typeof booleanValuesMap | string): boolean | undefined => booleanValuesMap[value],
};

export const ENV_METADATA = Symbol('env');
const allowedTypes: { [key: string]: AnyFn } = { string: String, number: Number, boolean: Boolean };

function findEnvVarName(param1: Param1, propertyKey: string | symbol): ReadonlyArray<string> {
  if (typeof param1 === 'string') return [param1];
  if (Array.isArray(param1)) return param1 as string[];
  if (typeof propertyKey === 'string') return [propertyKey];

  throw new Error(`Can't find ENV variable name.
    Property Key: ${ String(propertyKey) }
    Param1: ${ JSON.stringify(param1) }
  `);
}

function findOptions(param1: Param1, param2: Options | undefined): Options {
  if (param2) {
    return param2;
  }
  if (param1 && typeof param1 === 'object' && param1.constructor === Object) {
    return param1 as Options;
  }
  return {};
}

export function Env(param1?: Param1, param2?: Options): PropertyDecorator {
  return (target: AnyObject, propertyKey: string | symbol): void => {
    const envVarName = findEnvVarName(param1, propertyKey);
    const decoratorOptions = findOptions(param1, param2);
    const propertyType = Reflect.getMetadata('design:type', target, propertyKey) as AnyFn;
    const propertyTypeName = propertyType ? propertyType.name.toLowerCase() : null;
    const defaultType = ((propertyTypeName != null && allowedTypes[propertyTypeName]) ? propertyType.name.toLowerCase() : 'string') as PropertyType;

    const propertyOptions: PropertyMeta = {
      envVarName,
      ...decoratorOptions,
      transform: transformMap[decoratorOptions.type || defaultType],
    };

    // TODO: use Map instead of object
    const existingEnvParams = (Reflect.getMetadata(ENV_METADATA, target) || {}) as AnyObject;
    Reflect.defineMetadata(
      ENV_METADATA,
      {
        ...existingEnvParams,
        [propertyKey]: propertyOptions,
      },
      target,
    );
  };
}
