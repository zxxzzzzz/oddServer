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
  // updateMethodRuleList();
})();
