# http4t

![teapot](https://user-images.githubusercontent.com/123496/53679728-5e9d3e80-3cc8-11e9-81ff-af48da63d422.png)

[![CircleCI](https://circleci.com/gh/http4t/http4t.svg?style=svg)](https://circleci.com/gh/http4t/http4t)

[![Testing Powered By SauceLabs](https://opensource.saucelabs.com/images/opensauce/powered-by-saucelabs-badge-gray.png?sanitize=true "Testing Powered By SauceLabs")](https://saucelabs.com)

A modular web framework for Typescript

Supports [RFC 2324](https://tools.ietf.org/html/rfc2324)

## Contributing

### Build commands

#### On first checkout

```
yarn install
yarn run build
```

####To run all tests

```
yarn run test
```

#### To run a clean build

```
yarn run clean
./delete_node_modules
yarn install
yarn run build
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

```
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

```
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

```
{
  "name": "@http4t/my-module-test",
  "version": "1.0.0",
  "license": "Apache-2.0",
  "type": "module",
  "scripts": {
    "build": "tsc --build",
    "test": "NODE_ENV=development mocha --require ts-node/register --colors --exit  '**/*.test.ts'",
    "test:browser": "puppet"
  },
  "dependencies": {
    "@http4t/core": "1.0.0",
    "@http4t/mocha-puppeteer": "1.0.0",
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

```
{
  "extends": "../../tsconfig-base.json",
  "references": [
    {
      "path": "../src"
    },
    {
      "path": "../../http4t-mocha-puppeteer/src"
    },
    {
      "path": "../../http4t-core/src"
    }
  ]
}
```
