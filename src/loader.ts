import { ENV_METADATA, PropertyMeta, ValueType, LOAD_METADATA, LoadPropertyMeta } from './env.decorator';

export function loadConfig<T>(Config: new () => T): T {
  // tslint:disable-next-line:no-any
  const config: any = new Config();
  const envMeta: { readonly [key: string]: PropertyMeta } = Reflect.getMetadata(ENV_METADATA, config);

  const values: any = Object.keys(envMeta).reduce((valuesAcc: { readonly [key: string]: string }, propertyKey: string) => {
    const propertyMeta = envMeta[propertyKey];
    const envValue = tryCast(findEnvValue(propertyMeta), propertyMeta);

    checkValueRequired(propertyMeta, envValue);

    if (envValue == undefined) {
      return valuesAcc;
    }

    return { ...valuesAcc, [propertyKey]: envValue };
  }, {});

  const loadMeta: { readonly [key: string]: LoadPropertyMeta } = Reflect.getMetadata(LOAD_METADATA, config);
  for (const propertyName in loadMeta) {
    values[propertyName] = loadConfig(loadMeta[propertyName].configType);
  }
  return Object.freeze({ ...config, ...values });
}

function checkValueRequired(propertyMeta: PropertyMeta, envValue: ValueType): void {
  if (propertyMeta.required && envValue == undefined) {
    throw new Error(`Missing variable: ${ propertyMeta.envVarName }`);
  }
}

function findEnvValue(propertyMeta: PropertyMeta): string | undefined {
  return propertyMeta.envVarName.map((envVarName: string) => process.env[envVarName]).find((envValue?: string) => envValue != undefined);
}

function tryCast(envValue: string | undefined, { envVarName, transform }: PropertyMeta): ValueType {
  if (envValue == undefined) {
    return;
  }

  try {
    return transform(envValue);
  } catch (err) {
    throw new Error(`Failed to transform property ${ envVarName } (value: ${ envValue })`);
  }
}
