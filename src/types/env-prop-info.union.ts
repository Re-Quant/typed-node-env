/* eslint-disable import/no-cycle */

import { EnvBooleanPropInfo } from '../decorators/env-boolean.decorator';
import { EnvEnumPropInfo } from '../decorators/env-enum.decorator';
import { EnvFloatPropInfo } from '../decorators/env-float.decorator';
import { EnvIntegerPropInfo } from '../decorators/env-integer.decorator';
import { EnvStringPropInfo } from '../decorators/env-string.decorator';
import { EnvNestedPropInfo } from '../decorators/env-nested.decorator';

export type UEnvPropInfo =
    | EnvBooleanPropInfo
    | EnvEnumPropInfo
    | EnvFloatPropInfo
    | EnvIntegerPropInfo
    | EnvNestedPropInfo
    | EnvStringPropInfo
    ;
