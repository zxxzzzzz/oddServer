import { readFileSync, writeFileSync } from 'fs';
import Convert from 'xml-js';
import {
  solveThreeVariableLinearEquations,
  updateGoalLineRuleList,
  getCoefficient,
  solveFourVariableLinearEquations,
  getSinData,
  toAsyncTimeFunction,
  toFifoFunction,
} from './utils/index.js';
import { delay } from './api/utils.js';
import { randomUUID } from 'crypto';

(async () => {
  // updateGoalLineRuleList();
  // writeFileSync('./user.json', JSON.stringify({ userList: ac }), { encoding: 'utf-8' })
})();
