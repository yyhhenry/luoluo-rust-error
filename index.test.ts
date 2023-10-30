import assert from 'assert';
import { rustError, rustErrorAsync } from './index';
import { describe, expect, test } from 'vitest';
describe('rustError', () => {
  test('should return Ok if the function executes successfully', () => {
    const fn = () => 42;
    const result = rustError(fn)();
    expect(result).toStrictEqual({ ok: true, v: 42 });
  });

  test('should return Err if the function throws an error', () => {
    const fn = () => {
      throw new Error('Something went wrong');
    };
    const result = rustError(fn)();
    assert(result.ok === false);
    assert(result.e instanceof Error);
    assert(result.e.message === 'Something went wrong');
  });

  test('should return Err if the function throws an error that matches the filter', () => {
    const fn = () => {
      throw new TypeError('Invalid argument');
    };
    const filter = (e: unknown): e is TypeError => e instanceof TypeError;
    const result = rustError(fn, filter)();
    assert(result.ok === false);
    assert(result.e instanceof TypeError);
    assert(result.e.message === 'Invalid argument');
  });

  test('should rethrow the error if the function throws an error that does not match the filter', () => {
    const fn = () => {
      throw new TypeError('Invalid argument');
    };
    const filter = (e: unknown): e is SyntaxError => e instanceof SyntaxError;
    const wrappedFn = rustError(fn, filter);
    expect(() => wrappedFn()).toThrow(TypeError);
  });
});

describe('rustErrorAsync', () => {
  test('should return Ok if the function executes successfully', async () => {
    const fn = async () => 42;
    const result = await rustErrorAsync(fn)();
    expect(result).toStrictEqual({ ok: true, v: 42 });
  });

  test('should return Err if the function throws an error', async () => {
    const fn = async () => {
      throw new Error('Something went wrong');
    };
    const result = await rustErrorAsync(fn)();
    assert(result.ok === false);
    assert(result.e instanceof Error);
    assert(result.e.message === 'Something went wrong');
  });

  test('should return Err if the function throws an error that matches the filter', async () => {
    const fn = async () => {
      throw new TypeError('Invalid argument');
    };
    const filter = (e: unknown): e is TypeError => e instanceof TypeError;
    const result = await rustErrorAsync(fn, filter)();
    assert(result.ok === false);
    assert(result.e instanceof TypeError);
    assert(result.e.message === 'Invalid argument');
  });

  test('should rethrow the error if the function throws an error that does not match the filter', async () => {
    const fn = async () => {
      throw new TypeError('Invalid argument');
    };
    const filter = (e: unknown): e is SyntaxError => e instanceof SyntaxError;
    const wrappedFn = rustErrorAsync(fn, filter);
    await expect(wrappedFn()).rejects.toBeInstanceOf(TypeError);
  });
});
