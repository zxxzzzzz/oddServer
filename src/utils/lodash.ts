import { existsSync, statSync, writeFileSync } from 'fs';
import path from 'path';
import { delay } from '../api/utils';
import dayjs from 'dayjs';

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
export function toAsyncTimeFunction<T extends (...args: any[]) => any>(
  fn: T,
  tag: string,
  desc: string | ((args: Parameters<T>, result: Awaited<ReturnType<T>>) => string) = ''
): T {
  return async function (...args: Parameters<T>): Promise<ReturnType<T>> {
    let filePath = range(0, 100)
      .map((i) => {
        return path.resolve(__dirname, `../../log/performance-${dayjs().format('YYYY-MM-DD')}-p${i}.csv`);
      })
      .find((filePath) => {
        if (!existsSync(filePath)) return true;
        if (statSync(filePath).size / 1024 / 1024 < 10) return true;
        return false;
      });
    if (!filePath) {
      filePath = path.resolve(__dirname, `../../log/performance-${dayjs().format('YYYY-MM-DD')}-p101.csv`);
    }
    const start = performance.now(); // 记录开始时间
    const result = await fn(...args); // 调用原函数
    const end = performance.now(); // 记录结束时间
    const duration = end - start; // 计算执行时间
    const description = typeof desc === 'string' ? desc : desc(args, result);
    if (!existsSync(filePath)) {
      writeFileSync(filePath, `date, tag, duration, description\n`, { encoding: 'utf-8' });
    }
    writeFileSync(filePath, `${new Date().toISOString()}, ${tag}, ${duration}, ${description}\n`, {
      flag: 'a',
      encoding: 'utf-8',
    });
    return result;
  } as T;
}

export function warnLog(text: string) {
  const filePath = path.resolve(__dirname, '../../log/warn.csv');
  if (!existsSync(filePath)) {
    writeFileSync(filePath, `date, description\n`, { encoding: 'utf-8' });
  }
  writeFileSync(filePath, `${new Date().toISOString()}, ${text}\n`, {
    flag: 'a',
    encoding: 'utf-8',
  });
}
export function errorLog(text: string) {
  const filePath = path.resolve(__dirname, '../../log/error.csv');
  if (!existsSync(filePath)) {
    writeFileSync(filePath, `date, description\n`, { encoding: 'utf-8' });
  }
  writeFileSync(filePath, `${new Date().toISOString()}, ${text}\n`, {
    flag: 'a',
    encoding: 'utf-8',
  });
}

/**先进先出的promise包装函数 */
export function toFifoFunction<T extends (...args: any[]) => Promise<any>>(fn: T) {
  const taskList: (() => Promise<any>)[] = [];
  /**是否有任务正在进行 */
  let isProcessing = false;
  return async function (...args: any[]): Promise<ReturnType<T>> {
    taskList.push(fn.bind(null, ...args));
    while (true) {
      await delay(100);
      if (isProcessing) continue;
      const task = taskList.shift()!;
      // task执行前，设置任务在进行
      isProcessing = true;
      const re = await task();
      // task执行后，设置任务没在进行
      isProcessing = false;
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

export function pickBy<T>(
  object: Record<string, T>,
  predicate: (value: T, key: string, object: Record<string, T>) => boolean
): Record<string, T> {
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
export function everyWithTolerance<T>(array: T[], predicate: Predicate<T>, tolerance: number = 0.12): boolean {
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
 * 将字符串格式化为保留两位小数的字符串。
 *
 * @param value - 输入的字符串，应该是一个有效的数字表示。
 * @returns 格式化后的字符串，保留两位小数。
 */
export function strFixed(value: string, count: number = 2): string {
  // 将输入的字符串转换为浮点数
  const numberValue = parseFloat(value);

  // 检查转换后的值是否为 NaN（Not-a-Number）
  // 如果是 NaN，说明输入的字符串不是一个有效的数字格式
  if (isNaN(numberValue)) {
    return value;
  }

  // 使用 toFixed 方法将数字格式化为保留两位小数的字符串
  // toFixed 方法会四舍五入
  return numberValue.toFixed(count);
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
function solveFourVariableLinearEquations(op: {
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
  // console.log('validVariableList', validVariableList);

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

/**
 * 使用高斯消元法求解线性方程组 Ax = b
 * @param A 系数矩阵
 * @param b 常数项向量
 * @returns 解向量 x
 */
export function getGaussElimination(pA: number[][], pB: number[]): number[] {
  const isColNone = (col: number) => {
    return pA.map((item) => item?.[col]).every((n) => !n);
  };
  const isLineNone = (line: number) => {
    if (!pA?.[line]?.length) return true;
    return pA[line].every((n) => !n);
  };

  // 未知数数量
  const A = pA
    .filter((_, n) => !isLineNone(n))
    .map((item) => {
      return item.filter((_, col) => {
        return !isColNone(col);
      });
    });
  const n = A.length; // 获取矩阵的大小
  const x = new Array(n).fill(0); // 初始化解向量 x，初始值为 0
  const b = pB.filter((_, line) => !isLineNone(line));

  // 创建增广矩阵 [A|b]
  for (let i = 0; i < n; i++) {
    A[i].push(b[i]);
  }

  // 前向消元
  for (let i = 0; i < n; i++) {
    // 找到当前列的最大值所在的行，以避免除以接近零的数
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(A[k][i]) > Math.abs(A[maxRow][i])) {
        maxRow = k;
      }
    }

    // 交换当前行和最大值所在的行
    [A[i], A[maxRow]] = [A[maxRow], A[i]];

    // 检查主元是否为零，如果是，则矩阵是奇异的
    if (A[i][i] === 0) {
      throw new Error('Matrix is singular');
    }

    // 将当前列下方的所有元素消为零
    for (let j = i + 1; j < n; j++) {
      const factor = A[j][i] / A[i][i]; // 计算消元因子
      for (let k = i; k <= n; k++) {
        A[j][k] -= factor * A[i][k]; // 更新增广矩阵
      }
    }
  }

  // 回代求解
  for (let i = n - 1; i >= 0; i--) {
    x[i] = A[i][n] / A[i][i]; // 计算当前变量的值
    for (let j = i - 1; j >= 0; j--) {
      A[j][n] -= A[j][i] * x[i]; // 更新增广矩阵的最后一列
    }
  }
  const _x = [...x];
  // 返回解向量
  const re = range(0, pA.length).map((n) => {
    if (isColNone(n)) return 0;
    return _x.shift();
  });
  // console.log(re, pA, A, b);
  return re;
}

export const toFixNumber = (num: number, fixCount: number) => {
  if (!num) return 0;
  return parseFloat(num.toFixed(fixCount));
};
export const toNumber = (v: string | number) => {
  if (typeof v === 'number') return v;
  if (v === 'J3') return 3;
  if (v === 'J2') return 2;
  if (v === 'J1') return 1;
  return Number.isNaN(parseFloat(v)) ? 0 : parseFloat(v);
};

/**计算最大可能的编辑距离 
 *  - 示例使用
    ```const s1 = "你好世界";```  
    ```const s2 = "你好世间";```  
    ``` // 输出：0.75```  
    ```console.log(`归一化编辑距离: ${normalizedLevenshteinDistance(s1, s2).toFixed(2)}`);```
*/
function getStrSameWeight(s1: string, s2: string): number {
  const len1 = s1.length;
  const len2 = s2.length;

  // 如果其中一个字符串为空，则返回另一个字符串的长度
  if (len1 === 0) return 1.0;
  if (len2 === 0) return 1.0;

  // 创建一个二维数级来存储子问题的结果
  const matrix: number[][] = Array.from({ length: len1 + 1 }, () => Array(len2 + 1).fill(0));

  // 初始化第一行和第一列
  for (let i = 0; i <= len1; i++) {
    matrix[i][0] = i;
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  // 动态规划填充矩阵
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // 删除
        matrix[i][j - 1] + 1, // 插入
        matrix[i - 1][j - 1] + cost // 替换
      );
    }
  }

  // 计算最大可能的编辑距离
  const maxLength = Math.max(len1, len2);

  // 返回归一化的编辑距离
  return 1 - matrix[len1][len2] / maxLength;
}

/**获取联赛相似度权重 完全相似就是1*/
export const getLeagueSameWeight = (leagueName1: string, leagueName2: string) => {
  const l1 = leagueName1
    .toString()
    .replace(/组/g, '级')
    .replace(/(-|附加赛|升级)/g, '');
  const l2 = leagueName2
    .toString()
    .replace(/组/g, '级')
    .replace(/(-|附加赛|升级)/g, '');
  const equalNameList = [
    ['日本职业联赛杯', '日本联赛杯'],
    ['澳大利亚超级联赛', '澳大利亚甲级联赛', '澳大利亚甲级联赛'],
    ['欧罗巴联赛', '欧洲联赛'],
    ['韩国K甲级联赛', '韩国职业联赛'],
    ['日本J1联赛', '日本职业联赛'],
    ['日本J2联赛', '日本职业乙级联赛', '日本乙级联赛'],
    ['英格兰冠军联赛-附加赛', '英格兰冠军联赛'],
    ['世界U20锦标赛', 'U20世界杯2023(在阿根廷)'],
    ['美国公开赛冠军杯', '美国公开赛杯'],
    ['南美解放者杯', '南美自由杯'],
    ['欧洲国家联赛', '欧洲国家联赛A', '欧洲国家联赛B', '欧洲国家联赛C', '欧洲国家联赛D'],
    ['欧洲杯预选赛', '欧洲足球锦标赛2024外围赛'],
    ['国际赛', '国际友谊赛'],
    ['国际赛', '美洲国家联赛A'],
    ['欧洲U21锦标赛', '欧洲U21青年锦标赛2023(在罗马尼亚和格鲁吉亚)'],
    ['中北美金杯赛', '美洲金杯2023(在美国和加拿大)'],
    ['欧洲冠军联赛外围赛', '欧洲冠军联赛'],
    ['女足世界杯', '女子世界杯2023(在澳大利亚和纽西兰)'],
    ['英格兰联赛锦标赛', '英格兰锦标赛'],
    ['欧罗巴联赛', '欧洲联赛'],
    ['欧罗巴联赛', '欧洲联赛外围赛'],
    ['世界杯2026南美洲外围赛', '世界杯预选赛'],
    ['亚运会男足', '亚运会2022男子足球U23(在中国)'],
    ['亚洲冠军联赛', '亚足联冠军联赛'],
    ['世界杯预选赛', '世界杯2026亚洲外围赛', '世界杯2026南美洲外围赛', '世界杯2026非洲外围赛'],
    ['西班牙篮球联赛', '西班牙篮球甲级联赛'],
    ['美国职业篮球联盟', 'NBA美国职业篮球联赛'],
    ['美国职业篮球联盟', 'NBA美国职业篮球联赛'],
    ['亚洲杯', '亚洲杯2023(在卡塔尔)'],
    ['非洲国家杯', '非洲国家杯2023(在象牙海岸)'],
    ['瑞典超级甲级联赛', '瑞典超级联赛'],
  ];
  const isEqual = !!equalNameList.some((d) => d.includes(l1) && d.includes(l2));
  if (isEqual) {
    return 1;
  }
  return getStrSameWeight(l1, l2);
};

/**获取队伍相似度权重 */
export const getTeamSameWeight = (teamName1: string, teamName2: string) => {
  const equalTeamList = [
    ['博德闪耀', '波杜基林特'],
    ['腓特烈', '费德列斯达'],
  ];
  const isEqual = !!equalTeamList.some((d) => d.includes(teamName1) && d.includes(teamName2));
  if (isEqual) {
    return 1;
  }
  return getStrSameWeight(teamName1, teamName2);
};

/**把 2/5 = (2+5)/2 */
export const getRatioAvg = (str: string, isNegative: boolean) => {
  if (!str) return '-';
  if (str === '-') return '-';
  const splitCount = str.split('/').length;
  let count = str.split('/').reduce((re, cur) => re + Math.abs(parseFloat(cur)), 0) / splitCount;
  if (isNegative) {
    count = -count;
  }
  if (count === 0) return '0';
  // 去除末尾的0和小数点
  return count
    .toString()
    .replace(/(\.\d*?[1-9])0+$/, '$1')
    .replace(/\.$/, '');
};

/**
 * 执行一个顺序的定时器，确保每次回调函数中的异步操作完成后再启动下一次定时。
 * @param callback - 返回 Promise 的异步回调函数。
 * @param interval - 时间间隔（毫秒），在上一次回调完成后等待的时间。
 * @param immediate - 是否要立即执行
 */
export async function executeSequentialIntervals(callback: () => Promise<void>, interval: number, immediate = true): Promise<void> {
  try {
    if (immediate) {
      // 等待回调函数中的异步操作完成
      await callback();
    }
    // 在指定的时间间隔后再次调用自身以启动下一次定时
    setTimeout(() => executeSequentialIntervals(callback, interval), interval);
  } catch (error) {
    // 捕获并打印回调函数中的错误信息
    console.error('Error in scheduled task:', error);
  }
}


/**
 * 根据提供的分组函数对数组进行分组，并返回一个包含分组键和分组值的对象数组。
 * 
 * @param array - 要分组的数组。
 * @param iteratee - 分组函数，接受数组中的每个元素并返回一个分组键。
 * @returns 一个数组，其中每个元素是一个对象，包含分组键和对应的分组值。
 */
export function zipBy<T>(array: T[], iteratee: (item: T) => string): Array<{ key: string, value: T[] }> {
  // 初始化一个记录类型的对象，用于存储分组结果
  const result: Record<string, T[]> = {} as Record<string, T[]>;

  // 初始化一个数组，用于存储最终的分组结果
  const output: Array<{ key: string, value: T[] }> = [];

  // 遍历数组中的每个元素
  array.forEach(item => {
      // 调用分组函数获取当前元素的分组键
      const key = iteratee(item);

      // 如果 result 对象中还没有该分组键对应的数组，则初始化一个空数组
      if (!result[key]) {
          result[key] = [];
      }

      // 将当前元素推入对应分组键的数组中
      result[key].push(item);
  });

  // 遍历 result 对象，将每个分组键和对应的分组值构建成一个对象，并将其推入 output 数组中
  for (const key in result) {
      if (result.hasOwnProperty(key)) {
          output.push({ key: key as string, value: result[key] });
      }
  }

  // 返回分组后的结果数组
  return output;
}
