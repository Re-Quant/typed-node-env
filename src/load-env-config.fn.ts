import { AnyObject, Type } from './types';
import { EnvConfigLoader } from './env-config-loader';
import { getMetadataStorage } from './metadata-storage';

export function loadEnvConfig<T extends AnyObject>(
  EnvConfigCtor: Type<T> | T,
  rawEnvObj: AnyObject = process.env,
): T {
  const metadata = getMetadataStorage();
  const ins = new EnvConfigLoader(metadata, rawEnvObj);

  return ins.load(EnvConfigCtor);
}
