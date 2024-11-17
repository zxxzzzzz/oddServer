import { existsSync, readFileSync, statSync, writeFileSync } from 'fs';
import Convert from 'xml-js';
import {
  solveThreeVariableLinearEquations,
  updateGoalLineRuleList,
  getCoefficient,
  getMatchSinData,
  toAsyncTimeFunction,
  toFifoFunction,
  pickBy,
  range,
} from './utils/index.js';
import { delay, uniqBy } from './api/utils.js';
import { randomUUID } from 'crypto';
// 运维接口
import { spawnSync, execSync } from 'child_process';
import { updateMethodRuleList } from './utils/methodRule.js';
import path from 'path';
import dayjs from 'dayjs';

(async () => {
  function gaussElimination(A: number[][], b: number[]): number[] {
    const n = A.length;
    const x = new Array(n).fill(0);

    // 增广矩阵
    for (let i = 0; i < n; i++) {
        A[i].push(b[i]);
    }

    // 前向消元
    for (let i = 0; i < n; i++) {
        let maxRow = i;
        for (let k = i + 1; k < n; k++) {
            if (Math.abs(A[k][i]) > Math.abs(A[maxRow][i])) {
                maxRow = k;
            }
        }
        // 交换行
        [A[i], A[maxRow]] = [A[maxRow], A[i]];

        if (A[i][i] === 0) {
            throw new Error("Matrix is singular");
        }

        for (let j = i + 1; j < n; j++) {
            const factor = A[j][i] / A[i][i];
            for (let k = i; k <= n; k++) {
                A[j][k] -= factor * A[i][k];
            }
        }
    }

    // 回代
    for (let i = n - 1; i >= 0; i--) {
        x[i] = A[i][n] / A[i][i];
        for (let j = i - 1; j >= 0; j--) {
            A[j][n] -= A[j][i] * x[i];
        }
    }

    return x;
}

// 示例使用
const A = [
    [1, 1, 1, 1, 1],
    [0, 2, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 3, 0, 0],
    [0, 0, 0, 4, 0]
];
const b = [5, 2, 0, 3, 4];

const solution = gaussElimination(A, b);
console.log(solution); // 输出解
})();
