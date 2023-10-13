/**
 * Represents a successful value in the Result type.
 * @template V The type of the value.
 */
export interface Ok<V> {
  ok: true;
  v: V;
}
export function Ok<V>(v: V): Ok<V> {
  return { ok: true, v };
}
/**
 * Represents an error value in the Result type.
 * @template E The type of the error value.
 */
export interface Err<E> {
  ok: false;
  e: E;
}
export function Err<E>(e: E): Err<E> {
  return { ok: false, e };
}
/**
 * Represents a value that can either be a success (`Ok`) or an error (`Err`).
 *
 * use `result.ok` to check if the operation is successful.
 *
 * @template V The type of the value if the operation is successful.
 * @template E The type of the error if the operation fails.
 */
export type Result<V, E> = Ok<V> | Err<E>;

export type ErrorFilter<E> = (e: unknown) => e is E;
export type Callable = (...args: never[]) => unknown;

/**
 * Wraps a function into an never-throwing function.
 *
 * Useful when you want to write error handling before further processing and avoid using `let` and nullable types.
 *
 * @example
 *
 * function outputFileIfExist(pathname: string) {
 *   const readFile = rustError(() => fs.readFileSync(pathname, 'utf-8'));
 *   const result = readFile();
 *   if (!result.ok) {
 *    console.log('Something went wrong');
 *   }
 *   console.log(result.v);
 * }
 */
export function rustError<Fn extends Callable>(
  fn: Fn,
): (...args: Parameters<Fn>) => Result<ReturnType<Fn>, unknown>;
export function rustError<Fn extends Callable, E>(
  fn: Fn,
  filter: ErrorFilter<E>,
): (...args: Parameters<Fn>) => Result<ReturnType<Fn>, E>;
export function rustError<Fn extends Callable, E>(
  fn: Fn,
  filter?: ErrorFilter<E>,
) {
  return function (...args: Parameters<Fn>) {
    try {
      return Ok(fn(...args));
    } catch (e) {
      if (filter === undefined || filter(e)) {
        return Err(e);
      }
      throw e;
    }
  };
}

/**
 * Wraps an async function into an never-throwing async function.
 * This is the async version of `rustError`.
 *
 * @see rustError
 */
export function rustErrorAsync<Fn extends Callable>(
  fn: Fn,
): (
  ...args: Parameters<Fn>
) => Promise<Result<Awaited<ReturnType<Fn>>, unknown>>;

export function rustErrorAsync<Fn extends Callable, E>(
  fn: Fn,
  filter: ErrorFilter<E>,
): (...args: Parameters<Fn>) => Promise<Result<Awaited<ReturnType<Fn>>, E>>;
export function rustErrorAsync<Fn extends Callable, E>(
  fn: Fn,
  filter?: ErrorFilter<E>,
) {
  return async function (...args: Parameters<Fn>) {
    try {
      return Ok(await fn(...args));
    } catch (e) {
      if (filter === undefined || filter(e)) {
        return Err(e);
      }
      throw e;
    }
  };
}
