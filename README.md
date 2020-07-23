https://github.com/igabesz/config-decorators
https://github.com/jbpionnier/env-decorator
https://github.com/Hippocrate/env-decorator

# Env Decorator

[![npm version](https://badge.fury.io/js/env-decorator.svg)](https://badge.fury.io/js/env-decorator)
[![Build Status](https://travis-ci.org/jbpionnier/env-decorator.svg?branch=master)](https://travis-ci.org/jbpionnier/env-decorator)
[![npm](https://img.shields.io/npm/dm/env-decorator.svg)](https://npm-stat.com/charts.html?package=env-decorator)

Type your environment variables with decorators for environment based configurations

## :package: Installation

To install the module from npm:

```
npm install --save env-decorator
```

## :blue_book: Usage

**Config class**

```js
import { loadConfig, Env } from 'env-decorator'

export class Config {
	
  @Env({ required: true })
  NODE_ENV: string

  // Use the 'number' or 'boolean' type
  @Env({ type: 'number' })
  PORT: number

  @Env()
  ELASTICSEARCH_URL: string

  @Env('APP_DEBUG', { type: 'boolean' })
  DEBUG: boolean = true

  @Env([ 'MONGO_URL', 'MONGO_URI', 'MONGODB_ADDON_URI' ])
  MONGO_URL: string
}

export const config = loadConfig(Config)
```

**Using nested configuration**
```js
export class MongoConfig {
  @Env()
  MONGO_URL: string

  @Env()
  MONGO_USER: string

  @Env()
  MONGO_PWD: string
}

export class Config {
	
  @Env({ required: true })
  NODE_ENV: string

  // Use the 'number' or 'boolean' type
  @Env({ type: 'number' })
  PORT: number

  @Env()
  ELASTICSEARCH_URL: string

  @Env('APP_DEBUG', { type: 'boolean' })
  DEBUG: boolean = true

  @Load()
  MONGO: MongoConfig
}

```

**Import**

```js
import * as elasticsearch from 'elasticsearch'
import { config } from './config'

const client = new elasticsearch.Client({
  host: config.ELASTICSEARCH_URL
})
```

## :memo: License

[MIT](http://opensource.org/licenses/MIT)
