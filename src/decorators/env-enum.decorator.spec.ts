import { EnvEnum, transformer } from './env-enum.decorator';

describe(`@${ EnvEnum.name }() -> transform`, () => {
  describe('SCENARIO: Valid cases', () => {
    it(`GIVEN: String enum as a normal TypeScript Enum
      WHEN: Enum value is valid (in the enum values scope)
      THEN: Should return raw value as is`, () => {
      enum ETest { One = 'one', Two = 'two' }

      const res1 = transformer('one', { enum: ETest });
      const res2 = transformer('two', { enum: ETest });

      expect(res1).toBe(ETest.One);
      expect(res2).toBe(ETest.Two);
    });

    it(`GIVEN: Numeric enum as a normal TypeScript Enum
      WHEN: Enum value is valid (in the enum values scope)
      THEN: Should return raw value transformed to an appropriate number`, () => {
      enum ETest { One = 1, Two = 2 }

      const res1 = transformer('1', { enum: ETest });
      const res2 = transformer('2', { enum: ETest });

      expect(res1).toBe(ETest.One);
      // explicit number used instead of enum on purpose to ensure raw value is parsed to number, because numeric enums
      // in the TypeScript contains both keys & values - numeric & string.
      expect(res2).toBe(2);
    });

    it(`GIVEN: String enum as an array
      WHEN: Enum value is valid (in the enum values scope)
      THEN: Should return raw value as is`, () => {
      const allowedValues = ['one', 'two'];

      const res1 = transformer('one', { enum: allowedValues });
      const res2 = transformer('two', { enum: allowedValues });

      expect(res1).toBe(allowedValues[0]);
      expect(res2).toBe(allowedValues[1]);
    });

    it(`GIVEN: Numeric enum as an array
      WHEN: Enum value is valid (in the enum values scope)
      THEN: Should return raw value transformed to an appropriate number`, () => {
      const allowedValues = [1, 2];

      const res1 = transformer('1', { enum: allowedValues });
      const res2 = transformer('2', { enum: allowedValues });

      expect(res1).toBe(allowedValues[0]);
      expect(res2).toBe(allowedValues[1]);
    });
  }); // SCENARIO: Valid cases

  describe('SCENARIO: Invalid cases: should throw a TypeError', () => {
    it(`GIVEN: String enum as a normal TypeScript Enum
      WHEN: Enum value is invalid (out of enum values scope)
      THEN: Should throw an error`, () => {
      enum ETest { One = 'one' }
      const cb = () => transformer('three', { enum: ETest });
      expect(cb).toThrowError('Can\'t cast to enum');
    });

    it(`GIVEN: Numeric enum as a normal TypeScript Enum
      WHEN: Enum value is invalid (out of enum values scope)
      THEN: Should throw an error`, () => {
      enum ETest { One = 123 }
      const cb = () => transformer('234', { enum: ETest });
      expect(cb).toThrowError('Can\'t cast to enum');
    });

    it(`GIVEN: String enum as an array
      WHEN: Enum value is invalid (out of enum values scope)
      THEN: Should throw an error`, () => {
      const allowedValues = ['one'];
      const cb = () => transformer('three', { enum: allowedValues });
      expect(cb).toThrowError('Can\'t cast to enum');
    });

    it(`GIVEN: Numeric enum as an array
      WHEN: Enum value is invalid (out of enum values scope)
      THEN: Should throw an error`, () => {
      const allowedValues = [123];
      const cb = () => transformer('234', { enum: allowedValues });
      expect(cb).toThrowError('Can\'t cast to enum');
    });
  }); // SCENARIO: Invalid cases: should throw a TypeError
});
