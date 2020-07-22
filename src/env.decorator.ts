export type ValueType = string | boolean | number | undefined

// tslint:disable-next-line:no-any
export type PropertyAnnotation = (target: { readonly constructor: any }, propertyKey: string) => void
export type PropertyType = 'string' | 'number' | 'boolean';
export interface Options {
  readonly type?: PropertyType;
  readonly required?: boolean;
}

export type Param1 = string | ReadonlyArray<string> | Options | undefined

export interface PropertyMeta extends Options {
  readonly envVarName: ReadonlyArray<string>;

  transform(value: string): ValueType;
}

export interface LoadPropertyMeta {
  configType: new () => any;
}

const transformMap = {
  string: (value: string): string => value,
  number: parseFloat,
  boolean: (value: string): boolean | undefined => {
    if (value === 'true') {
      return true;
    }
    if (value === 'false') {
      return false;
    }
  },
};

export const ENV_METADATA = Symbol('env');
const allowedTypes: { [key: string]: Function } = { string: String, number: Number, boolean: Boolean };
export function Env(param1?: Param1, param2?: Options): PropertyAnnotation {
  return (target: object, propertyKey: string): void => {
    const envVarName = findEnvVarName(param1, propertyKey);
    const decoratorOptions = findOptions(param1, param2);
    const propertyType: Function = Reflect.getMetadata('design:type', target, propertyKey);
    const propertyTypeName = propertyType ? propertyType.name.toLowerCase() : null;
    const defaultType = ((propertyTypeName != null && allowedTypes[propertyTypeName]) ? propertyType.name.toLowerCase() : 'string') as PropertyType;

    const propertyOptions: PropertyMeta = {
      envVarName,
      ...decoratorOptions,
      transform: transformMap[decoratorOptions.type || defaultType],
    };

    const existingEnvParams = Reflect.getMetadata(ENV_METADATA, target) || {};
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

export const LOAD_METADATA = Symbol('load');
export function Load() {
  return (target: object, propertyKey: string): void => {
    const loadParams = Reflect.getMetadata(LOAD_METADATA, target) || {};
    const configType = Reflect.getMetadata('design:type', target, propertyKey) || {};
    Reflect.defineMetadata(
      LOAD_METADATA,
      {
        ...loadParams,
        [propertyKey]: {
          configType,
        },
      },
      target,
    );
  };
}

function findEnvVarName(param1: Param1, propertyKey: string): ReadonlyArray<string> {
  if (typeof param1 === 'string') {
    return [param1];
  }
  if (Array.isArray(param1)) {
    return param1;
  }
  return [propertyKey];
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
