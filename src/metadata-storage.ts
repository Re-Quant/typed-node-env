import 'reflect-metadata';
import { EnvCtor } from './types';

import { UEnvPropInfo } from './types/env-prop-info.union'; // eslint-disable-line import/no-cycle

export interface EnvCtorPropInfo {
  envInfo?: UEnvPropInfo | UEnvPropInfo[];
}

export interface EnvCtorInfo {
  readonly propsInfo: Map<string | symbol, EnvCtorPropInfo>;
}

export class MetadataStorage {
  private readonly envCtorsInfo = new Map<EnvCtor, EnvCtorInfo>();

  public setCtorEnvPropInfo(ctor: EnvCtor, propertyKey: string | symbol, envPropInfo: UEnvPropInfo): void {
    const propInfo = this.getEnvCtorPropInfo(ctor, propertyKey);
    propInfo.envInfo = propInfo.envInfo === undefined  ? envPropInfo :
                       Array.isArray(propInfo.envInfo) ? [...propInfo.envInfo, envPropInfo] :
                                                         [propInfo.envInfo, envPropInfo];
  }

  public getEnvCtorInfo(ctor: EnvCtor): EnvCtorInfo {
    if (!this.envCtorsInfo.has(ctor)) {
      this.envCtorsInfo.set(ctor, this.makeEmptyEnvCtorInfo());
    }
    return this.envCtorsInfo.get(ctor)!;
  }

  public getEnvCtorPropInfo(ctor: EnvCtor, propertyKey: string | symbol): EnvCtorPropInfo {
    const { propsInfo } = this.getEnvCtorInfo(ctor);

    if (!propsInfo.has(propertyKey)) {
      propsInfo.set(propertyKey, this.makeEmptyEnvCtorPropInfo());
    }
    return propsInfo.get(propertyKey)!;
  }

  private makeEmptyEnvCtorInfo(): EnvCtorInfo {
    return { propsInfo: new Map<string | symbol, EnvCtorPropInfo>() };
  }

  private makeEmptyEnvCtorPropInfo(): EnvCtorPropInfo {
    return {};
  }

}

let instance: MetadataStorage;

export function resetMetadataStorage(): void {
  instance = new MetadataStorage();
}
export function getMetadataStorage(): MetadataStorage {
  if (!instance) resetMetadataStorage();
  return instance;
}
