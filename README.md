# luoluo-rust-error

Rust-like error handling in TypeScript.

Provides `Result<T, E>` and `Ok<T>` and `Err<E>` types.

Use `Ok()` and `Err()` to create `Result<T, E>` values.

Works well with TypeScript's type narrowing.

Use `rustError()` and `rustErrorAsync()` to wrap your functions that may throw errors.

Feel free to add filters to these two.

## Best Practice

```ts
import { Ok, Err, Result, rustError } from 'luoluo-rust-error';

function getStatusBase(): string {
  const condition = Math.floor(Math.random() * 3);
  // Some progress that may fail or give out some unexpected result,
  // .e.g. network request
  if (condition === 0) {
    throw new Error('error');
  } else if (condition === 1) {
    return '+';
  }
  return '200';
}

// Before
export function getStatus1(): { status: number } | { error: string } {
  let result: string | undefined = undefined;
  // Variables are nullable
  // In this case, non-nullable type can be inferred, but it is not always possible, especially when there are some lambda functions
  try {
    result = getStatusBase();
  } catch (error) {
    return { error: 'Cannot get status' };
  }
  let status: number | undefined = undefined;
  // So many try-catch blocks
  try {
    status = parseInt(result);
  } catch (error) {
    return { error: 'malformed status' };
  }
  return { status };
}
export function getStatus2(): { status: number } | { error: string } {
  // One giant try-catch block
  // Uneasy to judge the error type
  // May catch some unexpected errors
  try {
    const result = getStatusBase();
    const status = parseInt(result);
    return { status };
  } catch (error) {
    return { error: 'Unknown error' };
  }
}

// After
export function getStatus(): Result<number, string> {
  const result = rustError(getStatusBase)();
  // Variables are non-nullable and errors are solved at once, with type inference
  // The caught error is the expected error
  if (!result.ok) {
    return Err('Cannot get status');
  }
  const status = rustError(parseInt)(result.v);
  if (!status.ok) {
    return Err('malformed status');
  }
  return Ok(status.v);
}
```

## Basic Usage

```ts
import { Ok, Err, Result, rustError } from 'luoluo-rust-error';

// Never-throwing function usage
function neverThrowFunc(err: boolean): Result<string, Error> {
  if (err) {
    return Err(new Error('error'));
  }
  return Ok('ok');
}
function neverThrowTest(err: boolean) {
  const result = neverThrowFunc(err);
  if (result.ok) {
    console.log(`Ok(${result.v})`);
  } else {
    console.log(`Err(${result.e.message})`);
  }
}
neverThrowTest(true); // Err(error)
neverThrowTest(false); // Ok(ok)

// Wrapped function usage
type ErrorEnum = 'TypeError' | 'SyntaxError';
function normalFunc(err?: ErrorEnum): string {
  if (err === 'TypeError') {
    throw new TypeError('type error');
  } else if (err === 'SyntaxError') {
    throw new SyntaxError('syntax error');
  }
  return 'ok';
}
const isTypeError = (e: unknown): e is TypeError => e instanceof TypeError;
function wrapTest(err?: ErrorEnum) {
  try {
    // The filter can be omitted, but the type of result will be `Result<string, unknown>`
    const result = rustError(normalFunc, isTypeError)(err);
    if (result.ok) {
      console.log(`Ok(${result.v})`);
    } else {
      console.log(`Err(TypeError(${result.e.message}))`);
    }
  } catch (error) {
    console.log(`UnwrapErr(${error})`);
  }
}

wrapTest('TypeError'); // Err(TypeError(type error))
wrapTest('SyntaxError'); // UnwrapErr(SyntaxError: syntax error)
wrapTest(); // Ok(ok)

// Wrapped built-in function usage
const isSyntaxError = (e: unknown): e is SyntaxError =>
  e instanceof SyntaxError;
const safeParseJSON = rustError(
  (text: string) => JSON.parse(text) as unknown,
  isSyntaxError,
);
function testSafeParseJSON(text: string) {
  const result = safeParseJSON(text);
  if (result.ok) {
    console.log(`Ok(${JSON.stringify(result.v)})`);
  } else {
    console.log(`Err(SyntaxError(${result.e.message}))`);
  }
}
testSafeParseJSON('{"a":1}'); // Ok({"a":1})
testSafeParseJSON('{a:1}'); // Err(SyntaxError(Unexpected token a in JSON at position 1))
testSafeParseJSON(''); // Err(SyntaxError(Unexpected end of JSON input))
testSafeParseJSON('1'); // Ok(1)
testSafeParseJSON('{"a":'); // Err(SyntaxError(Unexpected end of JSON input))
```
