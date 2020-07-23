export type AnyObject = { [key: string]: any };
export type AnyFn = (...args: any[]) => any;
export interface Type<T> extends Function {
  new (...args: any[]): T;
}
