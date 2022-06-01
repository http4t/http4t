# http4t

![teapot](https://user-images.githubusercontent.com/123496/53679728-5e9d3e80-3cc8-11e9-81ff-af48da63d422.png)

![Build](https://github.com/http4t/http4t/workflows/Build/badge.svg?branch=master)

A modular web framework for Typescript

Supports [RFC 2324](https://tools.ietf.org/html/rfc2324)

## Contributing

### Development loop

To run all tests from the root project:

```
yarn install
yarn run test
```

`yarn run test` in the root project runs both `test` and `test:browser` scripts
in all subprojects. 

See https://github.com/http4t/muppeteer for more on browser testing.

### Gotchas

In normal local development, you should never need to compile the typescript.

You'll get `ERR_UNKNOWN_FILE_EXTENSION` when you run the tests if there are compiled
`.js` files in any of the source directories.

To fix that, from the root run:

```
yarn run clean
```

### Creating a new module

Add new directory to root:

```
http4t-my-module
   src
      package.json
      tsconfig.json
   test
      package.json
      tsconfig.json
```

`http4t-my-module/src/package.json`:

Note dependency on `@http4t/core`.

```json
{
  "name": "@http4t/my-module",
  "version": "1.0.0",
  "license": "Apache-2.0",
  "type": "module",
  "scripts": {
    "build": "tsc --build"
  },
  "dependencies": {
    "@http4t/core": "1.0.0"
  }
}
```

`http4t-my-module/src/tsconfig.json`:

Note reference to `@http4t/core` source.

```json
{
  "extends": "../../tsconfig-base.json",
  "references": [
    {
      "path": "../../http4t-core/src"
    }
  ]
}
```

`http4t-my-module/test/package.json`:

Note `name: "@http4t/my-module-test"`

```json
{
  "name": "@http4t/my-module-test",
  "version": "1.0.0",
  "license": "Apache-2.0",
  "type": "module",
  "scripts": {
    "build": "tsc --build",
    "test": "NODE_ENV=development mocha --experimental-specifier-resolution=node --loader=ts-node/esm --extensions ts,tsx --colors --exit  '**/*.test.ts'",
    "test:browser": "muppeteer"
  },
  "dependencies": {
    "@http4t/core": "1.0.0",
    "@http4t/muppeteer": "^0.0.17",
    "@http4t/my-module": "1.0.0"
  },
  "devDependencies": {
    "@types/chai": "^4.1.7",
    "@types/mocha": "^5.2.6",
    "chai": "^4.1.7",
    "mocha": "^7.0.1"
  }
}
```

`http4t-my-module/test/tsconfig.json`:

Note reference to `@http4t/core` source.

```json
{
  "extends": "../../tsconfig-base.json",
  "references": [
    {
      "path": "../src"
    },
    {
      "path": "../../http4t-core/src"
    }
  ]
}
```
