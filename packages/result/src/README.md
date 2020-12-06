# @http4t/result

A standard way of representing success/failure results, where in the case of  failure
 we might want to flag issues with multiple elements in a complex data structure.

## Basics

A success looks like:

```typescript
const result = success("this value was ok!");
// -> {value: "this value was ok!"}
```

A failure looks like:

```typescript
type Thing = {
  name: string;
  price: number;
}

function validate(value: any) : Result<Thing> {
  const problems = [];

  if(typeof value.name !== 'string')
    problems.push(problem("expected a string", ["name"]))

  if(typeof value.price !== 'number')
    problems.push(problem("expected a number", ["price"]))
  
  if(problems.length > 0) return failure(problems);

  return success(value);
}

validate({});

// -> {problems: [
//          {message: "expected a string", path: ["name"]},
//          {message: "expected a number", path: ["price"]}
//     ]}
```

## Paths

The `path` in each problem is an array of `string | number`, which is a subset of jsonpath-
just object keys and array indexes. 

In the following data structure the value at path `["a", "b", 0, "c"]` is 1:

```typescript
{a: {
  b: [
    {c:1}, 
    {c:2}
  ]
}}
```

The equivalent json path of `["a", "b", 0, "c"]` would be `$.a.b.[0].c`.

## ResultError

Also provided is an error class that plays nicely with test runners and ides.

The error class will calculate an `error.expected` which is a copy of `actual`, 
but with the faulty values replaced with the `message` of any problems.

```typescript
const actual = {ok: "ok", wrong: "wrong"};
const error = new ResultError(actual, failure("some error message", ["wrong"]));

console.log(error.expected);
// --> {ok: "ok", wrong: "some error message"}
``` 