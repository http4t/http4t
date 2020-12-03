# http4t Mocha Puppeteer

* Generates a `mocha.html` file that imports all `*.test.ts` files under the
  working directory
* Uses [Parcel](https://parceljs.org) to bundle and serve `mocha.html`
* Uses [Puppeteer](https://github.com/puppeteer/puppeteer/) to call `mocha.run()`
  in Chrome headless and report back the results, failing on errors

## Usage

Add `mocha.html` to your `.gitignore` file.

`mocha.html` is regenerated for every run, but we don't clean it up afterwards,
because it is often useful to run `parcel serve mocha.html` to debug failures.

Add to `package.json`:

```json
{
  "scripts": {
    "build": "tsc --build",
    "test:browser": "puppet"
  },
  "devDependencies": {
    "@http4t/mocha-puppeteer": "1.0.0"
  }
}
```

## Adding to a module in http4t

In addition to the dependency in `package.json`, you need to add a reference
to `tsconfig.json`:

```json
{
  "extends": "../../tsconfig-base.json",
  "references": [
    {
      "path": "../src"
    },
    {
      "path": "../../http4t-mocha-puppeteer/src"
    }
  ]
}
```
