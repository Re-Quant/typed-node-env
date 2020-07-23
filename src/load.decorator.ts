import { AnyObject } from './ts-utils.type';

export const LOAD_METADATA = Symbol('load');
// TODO: rename
export function Load() {
  return (target: AnyObject, propertyKey: string): void => {
    const loadParams = (Reflect.getMetadata(LOAD_METADATA, target) || {}) as AnyObject;
    const configType = (Reflect.getMetadata('design:type', target, propertyKey) || {}) as AnyObject;
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
