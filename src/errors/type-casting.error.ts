import { AnyObject, EnvCtor } from '../types';
import { utils } from '../utils';

const reindent = (strings: TemplateStringsArray, ...args: any[]): string => {
  const raw = String.raw(strings, ...args);
  const space = ' '.repeat(4);
  const br = '\n';
  return raw.replace(/ *\n+ */g, `\n${ space }`).trim() + br;
};

export class TypeCastingError extends Error {
  public readonly name = 'TypeCastingError';

  public constructor(
      public readonly targetCtor: EnvCtor,
      public readonly propertyKey: string | symbol,
      public readonly previous: Error,
      public readonly raw: unknown,
      public readonly keyValueInfo: AnyObject,
  ) {
    super(reindent`${ utils.ctorAndPropStr(targetCtor, propertyKey) }: ${ previous.message }.
      ${ utils.makeSimpleRawValueInfoStr(raw) }
      ${ Object.entries(keyValueInfo).map(([k, v]) => `${ k }: ${ String(v) }`).join('\n') }
    `);

    Object.setPrototypeOf(this, new.target.prototype); // Restoring prototype chain
  }
}
