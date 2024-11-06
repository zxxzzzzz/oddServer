import { existsSync, writeFileSync } from 'fs';
import path from 'path';
import { delay } from 'src/api/utils.js';

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

/**记录promise函数执行时间的包装函数 */
export function toAsyncTimeFunction<T extends (...args: any[]) => any>(fn: T, tag: string): T {
  return async function (...args: Parameters<T>): Promise<ReturnType<T>> {
    const start = performance.now(); // 记录开始时间
    const result = await fn(...args); // 调用原函数
    const end = performance.now(); // 记录结束时间
    const duration = end - start; // 计算执行时间
    if (!existsSync(`./cache/${tag}.csv`)) {
      writeFileSync(path.resolve(import.meta.dirname, '../../cache/goalLineRule.csv'), `date, tag, duration\n`, { encoding: 'utf-8' });
    }
    writeFileSync(path.resolve(import.meta.dirname, '../../cache/goalLineRule.csv'), `${new Date().toISOString()}, ${tag}, ${duration}\n`, {
      flag: 'a',
      encoding: 'utf-8',
    });
    return result;
  } as T;
}

/**先进先出的promise包装函数 */
export function toFifoFunction<T extends (...args: any[]) => Promise<any>>(fn: T) {
  const taskList: (() => Promise<any>)[] = [];
  /**是否有任务正在进行 */
  let isProcessing = false
  return async function (...args: any[]) {
    taskList.push(fn.bind(null, ...args));
    while (taskList.length) {
      await delay(100)
      if(isProcessing) continue
      const task = taskList.shift();
      // 当前没任务了，说明肯定没任务在进行了
      if(!task) {
        isProcessing = false
        return void 0
      }
      // task执行前，设置任务在进行
      isProcessing = true
      const re = await task();
      // task执行后，设置任务没在进行
      isProcessing = false
      return re;
    }
  };
}

/**
 * 从对象中移除满足条件的属性
 *
 * @param object - 要处理的对象
 * @param predicate - 判断函数，返回 true 表示该属性应该被移除
 * @returns 新的对象，不包含满足条件的属性
 */
function omitBy<T>(object: Record<string, T>, predicate: (value: T, key: string, object: Record<string, T>) => boolean): Record<string, T> {
  const result: Record<string, T> = {};

  for (const [key, value] of Object.entries(object)) {
    if (!predicate(value, key, object)) {
      result[key] = value;
    }
  }

  return result;
}

/**
 * 求解二元一次方程组
 *
 * @param a1 - 第一个方程的 x 系数
 * @param b1 - 第一个方程的 y 系数
 * @param c1 - 第一个方程的常数项
 * @param a2 - 第二个方程的 x 系数
 * @param b2 - 第二个方程的 y 系数
 * @param c2 - 第二个方程的常数项
 * @returns 一个包含解 [x, y] 的数组，如果方程组无解或有无穷多解，则返回 null
 */
export function solveTwoVariableLinearEquations(op: {
  a1: number;
  b1: number;
  c1: number;
  a2: number;
  b2: number;
  c2: number;
}): [number, number] | null {
  const { a1, b1, c1, a2, b2, c2 } = op;
  // 计算系数矩阵的行列式
  const detA = a1 * b2 - a2 * b1;

  // 检查行列式是否为零
  if (detA === 0) {
    return null; // 方程组无解或有无穷多解
  }

  // 计算 x 和 y 的行列式
  const detAx = c1 * b2 - c2 * b1;
  const detAy = a1 * c2 - a2 * c1;

  // 计算 x 和 y
  const x = detAx / detA;
  const y = detAy / detA;

  return [x, y];
}

export function pickBy<T>(object: Record<string, T>, predicate: (value: T, key: string, object: Record<string, T>) => boolean): Record<string, T> {
  const result: Record<string, T> = {};

  for (const key in object) {
    if (object.hasOwnProperty(key)) {
      const value = object[key];
      if (predicate(value, key, object)) {
        result[key] = value;
      }
    }
  }

  return result;
}


type Predicate<T> = (value: T, index: number, array: T[]) => boolean;

/**
 * 检查数组中的元素是否满足给定的条件，允许一定比例的结果为 false。
 * 
 * @param array - 要检查的数组
 * @param predicate - 判断函数，返回 true 表示该元素满足条件
 * @param tolerance - 允许的 false 结果的比例，默认为 0.1（10%）
 * @returns 如果满足条件的元素数量超过允许的 false 结果比例，则返回 true，否则返回 false
 */
export function everyWithTolerance<T>(
    array: T[],
    predicate: Predicate<T>,
    tolerance: number = 0.12
): boolean {
    if (tolerance < 0 || tolerance > 1) {
        throw new Error('Tolerance must be between 0 and 1.');
    }
    const falseCount = Math.floor(array.length * tolerance);
    let falseCountSoFar = 0;

    for (let i = 0; i < array.length; i++) {
        if (!predicate(array[i], i, array)) {
            falseCountSoFar++;
            if (falseCountSoFar > falseCount) {
                return false;
            }
        }
    }

    return true;
}



/**
 * 求解三元一次方程组
 *
 * @param a1 - 第一个方程的 x 系数
 * @param b1 - 第一个方程的 y 系数
 * @param c1 - 第一个方程的 z 系数
 * @param d1 - 第一个方程的常数项
 * @param a2 - 第二个方程的 x 系数
 * @param b2 - 第二个方程的 y 系数
 * @param c2 - 第二个方程的 z 系数
 * @param d2 - 第二个方程的常数项
 * @param a3 - 第三个方程的 x 系数
 * @param b3 - 第三个方程的 y 系数
 * @param c3 - 第三个方程的 z 系数
 * @param d3 - 第三个方程的常数项
 * @returns 一个包含解 [x, y, z] 的数组，如果方程组无解或有无穷多解，则返回 null
 */
export function solveThreeVariableLinearEquations(op: {
  a1: number;
  b1: number;
  c1: number;
  d1: number;
  a2: number;
  b2: number;
  c2: number;
  d2: number;
  a3: number;
  b3: number;
  c3: number;
  d3: number;
}): [number, number, number] | null {
  const { a1, b1, c1, d1, a2, b2, c2, d2, a3, b3, c3, d3 } = op;
  // 将输入转换为矩阵形式
  const A = [
    [a1, b1, c1],
    [a2, b2, c2],
    [a3, b3, c3],
  ];
  const D = [d1, d2, d3];

  // 检查输入是否合法
  if (A.length !== 3 || A[0].length !== 3 || D.length !== 3) {
    throw new Error('Input must be a 3x3 matrix and a 3-element vector.');
  }

  // 高斯消元法
  for (let i = 0; i < 3; i++) {
    // 找到当前列的最大值，进行部分选主元
    let maxRow = i;
    for (let j = i + 1; j < 3; j++) {
      if (Math.abs(A[j][i]) > Math.abs(A[maxRow][i])) {
        maxRow = j;
      }
    }

    // 交换行
    [A[i], A[maxRow]] = [A[maxRow], A[i]];
    [D[i], D[maxRow]] = [D[maxRow], D[i]];

    // 检查主元是否为零
    if (A[i][i] === 0) {
      return null; // 方程组无解或有无穷多解
    }

    // 消元
    for (let j = i + 1; j < 3; j++) {
      const factor = A[j][i] / A[i][i];
      for (let k = i; k < 3; k++) {
        A[j][k] -= factor * A[i][k];
      }
      D[j] -= factor * D[i];
    }
  }

  // 回代求解
  const x: [number, number, number] = [0, 0, 0];
  for (let i = 2; i >= 0; i--) {
    let sum = 0;
    for (let j = i + 1; j < 3; j++) {
      sum += A[i][j] * x[j];
    }
    x[i] = (D[i] - sum) / A[i][i];
  }

  return x;
}

/**
 * 求解四元一次方程组
 *
 * @param a1 - 第一个方程的 x 系数
 * @param b1 - 第一个方程的 y 系数
 * @param c1 - 第一个方程的 z 系数
 * @param d1 - 第一个方程的 w 系数
 * @param e1 - 第一个方程的常数项
 * @param a2 - 第二个方程的 x 系数
 * @param b2 - 第二个方程的 y 系数
 * @param c2 - 第二个方程的 z 系数
 * @param d2 - 第二个方程的 w 系数
 * @param e2 - 第二个方程的常数项
 * @param a3 - 第三个方程的 x 系数
 * @param b3 - 第三个方程的 y 系数
 * @param c3 - 第三个方程的 z 系数
 * @param d3 - 第三个方程的 w 系数
 * @param e3 - 第三个方程的常数项
 * @param a4 - 第四个方程的 x 系数
 * @param b4 - 第四个方程的 y 系数
 * @param c4 - 第四个方程的 z 系数
 * @param d4 - 第四个方程的 w 系数
 * @param e4 - 第四个方程的常数项
 * @returns 一个包含解 [x, y, z, w] 的数组，如果方程组无解或有无穷多解，则返回 null
 */
export function solveFourVariableLinearEquations(op: {
  a1: number;
  b1: number;
  c1: number;
  d1: number;
  e1: number;
  a2: number;
  b2: number;
  c2: number;
  d2: number;
  e2: number;
  a3: number;
  b3: number;
  c3: number;
  d3: number;
  e3: number;
  a4: number;
  b4: number;
  c4: number;
  d4: number;
  e4: number;
}): [number, number, number, number] | null {
  const { a1, b1, c1, d1, e1, a2, b2, c2, d2, e2, a3, b3, c3, d3, e3, a4, b4, c4, d4, e4 } = op;

  const isANone = a1 === 0 && a2 === 0 && a3 === 0 && a4 === 0;
  const isBNone = b1 === 0 && b2 === 0 && b3 === 0 && b4 === 0;
  const isCNone = c1 === 0 && c2 === 0 && c3 === 0 && c4 === 0;
  const isDNone = d1 === 0 && d2 === 0 && d3 === 0 && d4 === 0;
  const omitList = [isANone ? 'a' : '', isBNone ? 'b' : '', isCNone ? 'c' : '', isDNone ? 'd' : ''].filter((d) => d);
  // 未知数数量
  const validVariableList = [
    { a: a1, b: b1, c: c1, d: d1, e: e1 },
    { a: a2, b: b2, c: c2, d: d2, e: e2 },
    { a: a3, b: b3, c: c3, d: d3, e: e3 },
    { a: a4, b: b4, c: c4, d: d4, e: e4 },
  ]
    .map(({ a, b, c, d, e }) => {
      if (a === 0 && b === 0 && c === 0 && d === 0) return void 0;
      const ob = omitBy({ a, b, c, d, e }, (v, k) => omitList.includes(k));
      return ['a', 'b', 'c', 'd', 'e'].map((k) => ob[k]).filter((v) => v !== void 0);
    })
    .filter((v): v is number[] => v !== void 0);
  console.log('validVariableList', validVariableList);

  if (validVariableList.length === 2) {
    const reList = solveTwoVariableLinearEquations({
      a1: validVariableList[0][0],
      b1: validVariableList[0][1],
      c1: validVariableList[0][2],

      a2: validVariableList[1][0],
      b2: validVariableList[1][1],
      c2: validVariableList[1][2],
    }) || [0, 0];
    return [
      isANone ? 0 : reList.shift() || 0,
      isBNone ? 0 : reList.shift() || 0,
      isCNone ? 0 : reList.shift() || 0,
      isDNone ? 0 : reList.shift() || 0,
    ];
  }
  if (validVariableList.length === 3) {
    const reList = solveThreeVariableLinearEquations({
      a1: validVariableList[0][0],
      b1: validVariableList[0][1],
      c1: validVariableList[0][2],
      d1: validVariableList[0][3],

      a2: validVariableList[1][0],
      b2: validVariableList[1][1],
      c2: validVariableList[1][2],
      d2: validVariableList[1][3],

      a3: validVariableList[2][0],
      b3: validVariableList[2][1],
      c3: validVariableList[2][2],
      d3: validVariableList[2][3],
    }) || [0, 0, 0];
    return [
      isANone ? 0 : reList.shift() || 0,
      isBNone ? 0 : reList.shift() || 0,
      isCNone ? 0 : reList.shift() || 0,
      isDNone ? 0 : reList.shift() || 0,
    ];
  }
  // 将输入转换为矩阵形式
  const A = [
    [a1, b1, c1, d1],
    [a2, b2, c2, d2],
    [a3, b3, c3, d3],
    [a4, b4, c4, d4],
  ];
  const E = [e1, e2, e3, e4];

  // 检查输入是否合法
  if (A.length !== 4 || A[0].length !== 4 || E.length !== 4) {
    throw new Error('Input must be a 4x4 matrix and a 4-element vector.');
  }

  // 高斯消元法
  for (let i = 0; i < 4; i++) {
    // 找到当前列的最大值，进行部分选主元
    let maxRow = i;
    for (let j = i + 1; j < 4; j++) {
      if (Math.abs(A[j][i]) > Math.abs(A[maxRow][i])) {
        maxRow = j;
      }
    }

    // 交换行
    [A[i], A[maxRow]] = [A[maxRow], A[i]];
    [E[i], E[maxRow]] = [E[maxRow], E[i]];

    // 检查主元是否为零
    if (A[i][i] === 0) {
      return null; // 方程组无解或有无穷多解
    }

    // 消元
    for (let j = i + 1; j < 4; j++) {
      const factor = A[j][i] / A[i][i];
      for (let k = i; k < 4; k++) {
        A[j][k] -= factor * A[i][k];
      }
      E[j] -= factor * E[i];
    }
  }

  // 回代求解
  const x: [number, number, number, number] = [0, 0, 0, 0];
  for (let i = 3; i >= 0; i--) {
    let sum = 0;
    for (let j = i + 1; j < 4; j++) {
      sum += A[i][j] * x[j];
    }
    x[i] = (E[i] - sum) / A[i][i];
  }

  return x;
}
