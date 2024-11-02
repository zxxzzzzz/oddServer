import { existsSync, writeFileSync } from "fs";

export function range(start: number, end?: number, step: number = 1): number[] {
  if (end === undefined) {
    // 如果只提供了一个参数，则将 start 视为 end，并将 start 设为 0
    end = start;
    start = 0;
  }
  const result: number[] = [];
  if (step > 0) {
    for (let i = start; i < end; i += step) {
      result.push(i);
    }
  } else if (step < 0) {
    for (let i = start; i > end; i += step) {
      result.push(i);
    }
  } else {
    throw new Error('Step cannot be zero.');
  }
  return result;
}


/**
 * 将数组分割成多个指定大小的子数组。
 *
 * @param {T[]} array - 要分割的原始数组。
 * @param {number} size - 每个子数组的最大长度。
 * @returns {T[][]} 分割后的子数组组成的数组。
 *
 * @example
 * chunk([1, 2, 3, 4, 5], 2); // 返回 [[1, 2], [3, 4], [5]]
 * chunk(['a', 'b', 'c', 'd'], 3); // 返回 [['a', 'b', 'c'], ['d']]
 * chunk([], 1); // 返回 []
 */
function chunk<T>(array: T[], size: number): T[][] {
  if (size <= 0) {
    throw new Error('Size must be a positive integer.');
  }

  const result: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}



export function uniqBy<T, U>(array: T[], iteratee: (value: T) => U): T[] {
  if (!Array.isArray(array)) {
    throw new TypeError('Expected an array');
  }

  const seen = new Set<U>();
  const result: T[] = [];

  for (const item of array) {
    const key = iteratee(item);
    if (key !== undefined && !seen.has(key)) {
      seen.add(key);
      result.push(item);
    }
  }

  return result;
}


export function maxBy<T>(array: T[], iteratee: (value: T) => number | string): T | undefined {
  if (array.length === 0) {
    return undefined; // 如果数级为空，返回 undefined
  }

  let maxElement: T = array[0];
  let maxValue = iteratee(maxElement);

  for (let i = 1; i < array.length; i++) {
    const currentValue = iteratee(array[i]);
    if (currentValue > maxValue) {
      maxElement = array[i];
      maxValue = currentValue;
    }
  }

  return maxElement;
}
export function minBy<T>(array: T[], iteratee: (value: T) => number | string): T | undefined {
  if (array.length === 0) {
    return undefined; // 如果数级为空，返回 undefined
  }

  let minElement: T = array[0];
  let minValue = iteratee(minElement);

  for (let i = 1; i < array.length; i++) {
    const currentValue = iteratee(array[i]);
    if (currentValue < minValue) {
      minElement = array[i];
      minValue = currentValue;
    }
  }

  return minElement;
}


// 定义一个泛型高阶函数，可以处理任何类型的输入和输出
export function asyncTimeFunction<T extends (...args: any[]) => any>(fn: T, tag: string): T {
  return async function (...args: Parameters<T>): Promise<ReturnType<T>> {
    const start = performance.now(); // 记录开始时间
    const result = await fn(...args); // 调用原函数
    const end = performance.now(); // 记录结束时间
    const duration = end - start; // 计算执行时间
    if (!existsSync(`./cache/${tag}.csv`)) {
      writeFileSync(`./cache/requestPerformance.csv`, `date, tag, duration\r\n`, { encoding: 'utf-8' });
    }
    writeFileSync(`./cache/requestPerformance.csv`, `${new Date().toISOString()}, ${tag}, ${duration}\r\n`, {
      flag: 'a',
      encoding: 'utf-8',
    });
    return result;
  } as T;
}
