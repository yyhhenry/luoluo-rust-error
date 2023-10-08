export interface Ok<V> {
  ok: true;
  v: V;
}
export function Ok<V>(v: V): Ok<V> {
  return { ok: true, v };
}
export interface Err<E> {
  ok: false;
  e: E;
}
export function Err<E>(e: E): Err<E> {
  return { ok: false, e };
}
export type Result<V, E> = Ok<V> | Err<E>;
export type ErrorFilter<E> = (e: unknown) => e is E;
export type Callable = (...args: never[]) => unknown;
export function withError<Fn extends Callable>(
  fn: Fn,
): (...args: Parameters<Fn>) => Result<ReturnType<Fn>, unknown>;
export function withError<Fn extends Callable, E>(
  fn: Fn,
  filter: ErrorFilter<E>,
): (...args: Parameters<Fn>) => Result<ReturnType<Fn>, E>;
export function withError<Fn extends Callable, E>(
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
export function withErrorAsync<Fn extends Callable>(
  fn: Fn,
): (
  ...args: Parameters<Fn>
) => Promise<Result<Awaited<ReturnType<Fn>>, unknown>>;
export function withErrorAsync<Fn extends Callable, E>(
  fn: Fn,
  filter: ErrorFilter<E>,
): (...args: Parameters<Fn>) => Promise<Result<Awaited<ReturnType<Fn>>, E>>;
export function withErrorAsync<Fn extends Callable, E>(
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
