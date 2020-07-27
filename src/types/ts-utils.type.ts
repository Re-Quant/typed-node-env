export type AnyObject = { [key: string]: any };
export type EmptyObject = {}; // eslint-disable-line @typescript-eslint/ban-types
export type Dictionary<T> = { [key: string]: T };
export type Inter<T extends AnyObject> = T & EmptyObject;

export type AnyFn = (...args: any[]) => any;

export type AnyEnum = AnyObject;

export interface Type<T> extends Function {
  new (...args: any[]): T;
}

export type EnvCtor = Type<any>;
export type EnvCtorProto = AnyObject;
export type EnvRawObject = Dictionary<string | undefined>;
export type EnvVarName = string | [string, ...string[]];
