import { utils } from './utils';
import { EnvCtor } from './types';

describe(`${ utils.constructor.name }`, () => {
  describe('.screamingSnakeCase()', () => {
    it('Should transform simple camelCase string to Screaming Snake Case', () => {
      expect(utils.screamingSnakeCase('mySuperProp')).toBe('MY_SUPER_PROP');
    });

    it('Should transform prefix and add it before the main string', () => {
      expect(utils.screamingSnakeCase('pass', 'mySuperPrefix')).toBe('MY_SUPER_PREFIX_PASS');
    });
    it('Should not touch already transformed strings', () => {
      expect(utils.screamingSnakeCase('MY_SUPER_PROP')).toBe('MY_SUPER_PROP');
    });
  });

  describe('.reflectEnvCtorOnProperty()', () => {
    it('Should retrieve class constructor from the property type', () => {
      let res: any;
      const getType: PropertyDecorator = (target, propertyKey) => {
        res = utils.reflectEnvCtorOnProperty(target, propertyKey, undefined);
      };
      class Foo {}
      class Bar { // eslint-disable-line @typescript-eslint/no-unused-vars
        @getType
        public nested!: Foo;
      }

      expect(res).toBe(Foo);
    });

    it('Should return Ctor from the params if it is specified', () => {
      let res: any;
      const GetType = (ctor: EnvCtor): PropertyDecorator => (target, propertyKey) => {
        res = utils.reflectEnvCtorOnProperty(target, propertyKey, ctor);
      };
      class Foo {}
      class Bar { // eslint-disable-line @typescript-eslint/no-unused-vars
        @GetType(Foo)
        public nested!: any;
      }

      expect(res).toBe(Foo);
    });
  });
});
