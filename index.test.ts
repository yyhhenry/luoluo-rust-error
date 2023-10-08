import assert from 'assert';
import { withError, withErrorAsync } from './index';

describe('withError', () => {
  it('should return Ok if the function executes successfully', () => {
    const fn = () => 42;
    const result = withError(fn)();
    expect(result).toStrictEqual({ ok: true, v: 42 });
  });

  it('should return Err if the function throws an error', () => {
    const fn = () => {
      throw new Error('Something went wrong');
    };
    const result = withError(fn)();
    assert(result.ok === false);
    assert(result.e instanceof Error);
    assert(result.e.message === 'Something went wrong');
  });

  it('should return Err if the function throws an error that matches the filter', () => {
    const fn = () => {
      throw new TypeError('Invalid argument');
    };
    const filter = (e: unknown): e is TypeError => e instanceof TypeError;
    const result = withError(fn, filter)();
    assert(result.ok === false);
    assert(result.e instanceof TypeError);
    assert(result.e.message === 'Invalid argument');
  });

  it('should rethrow the error if the function throws an error that does not match the filter', () => {
    const fn = () => {
      throw new TypeError('Invalid argument');
    };
    const filter = (e: unknown): e is SyntaxError => e instanceof SyntaxError;
    const wrappedFn = withError(fn, filter);
    expect(() => wrappedFn()).toThrow(TypeError);
  });
});

describe('withErrorAsync', () => {
  it('should return Ok if the function executes successfully', async () => {
    const fn = async () => 42;
    const result = await withErrorAsync(fn)();
    expect(result).toStrictEqual({ ok: true, v: 42 });
  });

  it('should return Err if the function throws an error', async () => {
    const fn = async () => {
      throw new Error('Something went wrong');
    };
    const result = await withErrorAsync(fn)();
    assert(result.ok === false);
    assert(result.e instanceof Error);
    assert(result.e.message === 'Something went wrong');
  });

  it('should return Err if the function throws an error that matches the filter', async () => {
    const fn = async () => {
      throw new TypeError('Invalid argument');
    };
    const filter = (e: unknown): e is TypeError => e instanceof TypeError;
    const result = await withErrorAsync(fn, filter)();
    assert(result.ok === false);
    assert(result.e instanceof TypeError);
    assert(result.e.message === 'Invalid argument');
  });

  it('should rethrow the error if the function throws an error that does not match the filter', async () => {
    const fn = async () => {
      throw new TypeError('Invalid argument');
    };
    const filter = (e: unknown): e is SyntaxError => e instanceof SyntaxError;
    const wrappedFn = withErrorAsync(fn, filter);
    await expect(wrappedFn()).rejects.toBeInstanceOf(TypeError);
  });
});
