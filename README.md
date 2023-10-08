# luoluo-rust-error

Rust-like error handling in TypeScript.

Provides `Result<T, E>` and `Ok<T>` and `Err<E>` types.

Use `Ok()` and `Err()` to create `Result<T, E>` values.

Works well with TypeScript's type narrowing.

Use `rustError()` and `rustErrorAsync()` to wrap your functions that may throw errors.

Feel free to add filters to these two.

## Basic Usage

```ts
import { Ok, Err, Result, rustError, rustErrorAsync } from 'luoluo-rust-error';

function foo(err: boolean): Result<string, Error> {
  if (err) {
    return Err(new Error('error'));
  }
  return Ok('ok');
}
function bar(n: number): string {
  if (n < 0) {
    throw new Error('n < 0');
  }
  return n.toString();
}
const resultBar = rustError(bar)(-1);
```

For more examples, see the source code.
