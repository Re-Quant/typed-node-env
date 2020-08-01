import { loadEnvConfig } from '../load-env-config.fn';
import { EnvRawObject } from '../types';

export const InternalEnvironmentClassFlag = Symbol('InternalEnvironmentClassFlag');

/**
 * This is a decorator which is applied to a config class to provide a possibility of filling the env data during
 * instantiation. This decorator extends the config class constructor and calls loadEnvConfig under the hood. So, no
 * need to call it manually in the case your class is decorated by Environment decorator.
 *
 * @param rawFactory by default `process.env` are used
 */
export function Environment(rawFactory?: () => EnvRawObject): ClassDecorator {
  // eslint-disable-next-line @typescript-eslint/ban-types,arrow-parens
  return <TFunction extends Function>(target: TFunction): TFunction => {
    // eslint-disable-next-line @typescript-eslint/no-implied-eval,no-new-func,@typescript-eslint/no-unsafe-assignment
    const Ctor: TFunction = new Function(
      'Base', 'loadEnvConfigFn', 'rawObj',
      `class $$${ target.name } extends Base {
         constructor(...args) {
           super(...args);
           loadEnvConfigFn(this, rawObj);
         }
       }
       return $$${ target.name };`,
    )(target, loadEnvConfig, rawFactory?.());

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    (Ctor as any)[InternalEnvironmentClassFlag] = true;

    return Ctor;
  };
}
