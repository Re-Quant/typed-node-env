import { Type } from '../types';
import { utils } from '../utils';

export class EnvPropDecorationError extends Error {
  public readonly name = 'EnvPropDecorationError';

  public constructor(
    public readonly targetCtor: Type<any>,
    public readonly propertyKey: string | symbol,
    public readonly decorator: PropertyDecorator | ((...args: any[]) => PropertyDecorator),
    message: string,
  ) {
    super(`Failed to decorate "${
      utils.ctorAndPropStr(targetCtor, propertyKey)
    }" with ${ decorator.name || '(unnamed decorator)' }: ${ message }`);

    Object.setPrototypeOf(this, new.target.prototype); // Restoring prototype chain
  }
}
