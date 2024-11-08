import { existsSync, writeFileSync } from 'fs';
import path from 'path';
import { delay } from '../api/utils.js';
export function range(start, end, step = 1) {
    if (end === undefined) {
        end = start;
        start = 0;
    }
    const result = [];
    if (step > 0) {
        for (let i = start; i < end; i += step) {
            result.push(i);
        }
    }
    else if (step < 0) {
        for (let i = start; i > end; i += step) {
            result.push(i);
        }
    }
    else {
        throw new Error('Step cannot be zero.');
    }
    return result;
}
function chunk(array, size) {
    if (size <= 0) {
        throw new Error('Size must be a positive integer.');
    }
    const result = [];
    for (let i = 0; i < array.length; i += size) {
        result.push(array.slice(i, i + size));
    }
    return result;
}
export function uniqBy(array, iteratee) {
    if (!Array.isArray(array)) {
        throw new TypeError('Expected an array');
    }
    const seen = new Set();
    const result = [];
    for (const item of array) {
        const key = iteratee(item);
        if (key !== undefined && !seen.has(key)) {
            seen.add(key);
            result.push(item);
        }
    }
    return result;
}
export function maxBy(array, iteratee) {
    if (array.length === 0) {
        return undefined;
    }
    let maxElement = array[0];
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
export function minBy(array, iteratee) {
    if (array.length === 0) {
        return undefined;
    }
    let minElement = array[0];
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
export function toAsyncTimeFunction(fn, tag, desc = '') {
    return async function (...args) {
        const start = performance.now();
        const result = await fn(...args);
        const end = performance.now();
        const duration = end - start;
        if (!existsSync(path.resolve(import.meta.dirname, '../../cache/requestPerformance.csv'))) {
            writeFileSync(path.resolve(import.meta.dirname, '../../cache/requestPerformance.csv'), `date, tag, duration, description\n`, { encoding: 'utf-8' });
        }
        const description = typeof desc === 'string' ? desc : desc(args, result);
        writeFileSync(path.resolve(import.meta.dirname, '../../cache/requestPerformance.csv'), `${new Date().toISOString()}, ${tag}, ${duration}, ${description}\n`, {
            flag: 'a',
            encoding: 'utf-8',
        });
        return result;
    };
}
export function warnLog(text) {
    if (!existsSync(path.resolve(import.meta.dirname, '../../cache/warn.csv'))) {
        writeFileSync(path.resolve(import.meta.dirname, '../../cache/warn.csv'), `date, description\n`, { encoding: 'utf-8' });
    }
    writeFileSync(path.resolve(import.meta.dirname, '../../cache/warn.csv'), `${new Date().toISOString()}, ${text}\n`, {
        flag: 'a',
        encoding: 'utf-8',
    });
}
export function errorLog(text) {
    if (!existsSync(path.resolve(import.meta.dirname, '../../cache/error.csv'))) {
        writeFileSync(path.resolve(import.meta.dirname, '../../cache/error.csv'), `date, description\n`, { encoding: 'utf-8' });
    }
    writeFileSync(path.resolve(import.meta.dirname, '../../cache/error.csv'), `${new Date().toISOString()}, ${text}\n`, {
        flag: 'a',
        encoding: 'utf-8',
    });
}
export function toFifoFunction(fn) {
    const taskList = [];
    let isProcessing = false;
    return async function (...args) {
        taskList.push(fn.bind(null, ...args));
        while (taskList.length) {
            await delay(100);
            if (isProcessing)
                continue;
            const task = taskList.shift();
            if (!task) {
                isProcessing = false;
                return void 0;
            }
            isProcessing = true;
            const re = await task();
            isProcessing = false;
            return re;
        }
    };
}
function omitBy(object, predicate) {
    const result = {};
    for (const [key, value] of Object.entries(object)) {
        if (!predicate(value, key, object)) {
            result[key] = value;
        }
    }
    return result;
}
export function solveTwoVariableLinearEquations(op) {
    const { a1, b1, c1, a2, b2, c2 } = op;
    const detA = a1 * b2 - a2 * b1;
    if (detA === 0) {
        return null;
    }
    const detAx = c1 * b2 - c2 * b1;
    const detAy = a1 * c2 - a2 * c1;
    const x = detAx / detA;
    const y = detAy / detA;
    return [x, y];
}
export function pickBy(object, predicate) {
    const result = {};
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
export function everyWithTolerance(array, predicate, tolerance = 0.12) {
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
export function strFixed(value, count = 2) {
    const numberValue = parseFloat(value);
    if (isNaN(numberValue)) {
        console.log(value);
        return value;
    }
    return numberValue.toFixed(count);
}
export function solveThreeVariableLinearEquations(op) {
    const { a1, b1, c1, d1, a2, b2, c2, d2, a3, b3, c3, d3 } = op;
    const A = [
        [a1, b1, c1],
        [a2, b2, c2],
        [a3, b3, c3],
    ];
    const D = [d1, d2, d3];
    if (A.length !== 3 || A[0].length !== 3 || D.length !== 3) {
        throw new Error('Input must be a 3x3 matrix and a 3-element vector.');
    }
    for (let i = 0; i < 3; i++) {
        let maxRow = i;
        for (let j = i + 1; j < 3; j++) {
            if (Math.abs(A[j][i]) > Math.abs(A[maxRow][i])) {
                maxRow = j;
            }
        }
        [A[i], A[maxRow]] = [A[maxRow], A[i]];
        [D[i], D[maxRow]] = [D[maxRow], D[i]];
        if (A[i][i] === 0) {
            return null;
        }
        for (let j = i + 1; j < 3; j++) {
            const factor = A[j][i] / A[i][i];
            for (let k = i; k < 3; k++) {
                A[j][k] -= factor * A[i][k];
            }
            D[j] -= factor * D[i];
        }
    }
    const x = [0, 0, 0];
    for (let i = 2; i >= 0; i--) {
        let sum = 0;
        for (let j = i + 1; j < 3; j++) {
            sum += A[i][j] * x[j];
        }
        x[i] = (D[i] - sum) / A[i][i];
    }
    return x;
}
export function solveFourVariableLinearEquations(op) {
    const { a1, b1, c1, d1, e1, a2, b2, c2, d2, e2, a3, b3, c3, d3, e3, a4, b4, c4, d4, e4 } = op;
    const isANone = a1 === 0 && a2 === 0 && a3 === 0 && a4 === 0;
    const isBNone = b1 === 0 && b2 === 0 && b3 === 0 && b4 === 0;
    const isCNone = c1 === 0 && c2 === 0 && c3 === 0 && c4 === 0;
    const isDNone = d1 === 0 && d2 === 0 && d3 === 0 && d4 === 0;
    const omitList = [isANone ? 'a' : '', isBNone ? 'b' : '', isCNone ? 'c' : '', isDNone ? 'd' : ''].filter((d) => d);
    const validVariableList = [
        { a: a1, b: b1, c: c1, d: d1, e: e1 },
        { a: a2, b: b2, c: c2, d: d2, e: e2 },
        { a: a3, b: b3, c: c3, d: d3, e: e3 },
        { a: a4, b: b4, c: c4, d: d4, e: e4 },
    ]
        .map(({ a, b, c, d, e }) => {
        if (a === 0 && b === 0 && c === 0 && d === 0)
            return void 0;
        const ob = omitBy({ a, b, c, d, e }, (v, k) => omitList.includes(k));
        return ['a', 'b', 'c', 'd', 'e'].map((k) => ob[k]).filter((v) => v !== void 0);
    })
        .filter((v) => v !== void 0);
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
    const A = [
        [a1, b1, c1, d1],
        [a2, b2, c2, d2],
        [a3, b3, c3, d3],
        [a4, b4, c4, d4],
    ];
    const E = [e1, e2, e3, e4];
    if (A.length !== 4 || A[0].length !== 4 || E.length !== 4) {
        throw new Error('Input must be a 4x4 matrix and a 4-element vector.');
    }
    for (let i = 0; i < 4; i++) {
        let maxRow = i;
        for (let j = i + 1; j < 4; j++) {
            if (Math.abs(A[j][i]) > Math.abs(A[maxRow][i])) {
                maxRow = j;
            }
        }
        [A[i], A[maxRow]] = [A[maxRow], A[i]];
        [E[i], E[maxRow]] = [E[maxRow], E[i]];
        if (A[i][i] === 0) {
            return null;
        }
        for (let j = i + 1; j < 4; j++) {
            const factor = A[j][i] / A[i][i];
            for (let k = i; k < 4; k++) {
                A[j][k] -= factor * A[i][k];
            }
            E[j] -= factor * E[i];
        }
    }
    const x = [0, 0, 0, 0];
    for (let i = 3; i >= 0; i--) {
        let sum = 0;
        for (let j = i + 1; j < 4; j++) {
            sum += A[i][j] * x[j];
        }
        x[i] = (E[i] - sum) / A[i][i];
    }
    return x;
}
