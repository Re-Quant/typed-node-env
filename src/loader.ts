import { ENV_METADATA, PropertyMeta, ValueType, LoadPropertyMeta } from './env.decorator';
import { LOAD_METADATA } from './load.decorator';

function checkValueRequired(propertyMeta: PropertyMeta, envValue: ValueType): void {
  if (propertyMeta.required && envValue == null) {
    throw new Error(`Missing variable: ${ String(propertyMeta.envVarName) }`);
  }
}

function findEnvValue(propertyMeta: PropertyMeta): string | undefined {
  return propertyMeta.envVarName
      .map((envVarName: string) => process.env[envVarName])
      .find((envValue?: string) => envValue != null);
}

function tryCast(envValue: string | undefined, { envVarName, transform }: PropertyMeta): ValueType {
  if (envValue == null) {
    return;
  }

  try {
    return transform(envValue);
  } catch (err) {
    throw new Error(`Failed to transform property ${ String(envVarName) } (value: ${ envValue })`);
  }
}

export function loadConfig<T>(Config: new () => T): T {
  // tslint:disable-next-line:no-any
  const config: any = new Config();
  const envMeta = Reflect.getMetadata(ENV_METADATA, config) as { readonly [key: string]: PropertyMeta };

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const values: any = Object
      .keys(envMeta)
      .reduce((valuesAcc: any, propertyKey: string) => {
        const propertyMeta = envMeta[propertyKey];
        const envValue = tryCast(findEnvValue(propertyMeta), propertyMeta);

        checkValueRequired(propertyMeta, envValue);

        if (envValue == null) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return valuesAcc;
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return { ...valuesAcc, [propertyKey]: envValue };
      }, {});

  const loadMeta = Reflect.getMetadata(LOAD_METADATA, config) as { readonly [key: string]: LoadPropertyMeta };
  Object.entries(loadMeta).forEach(([propertyName, value]) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
    values[propertyName] = loadConfig(value.configType);
  });

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return Object.freeze({ ...config, ...values });
}
