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
// 运维接口
import { spawnSync, execSync } from 'child_process';




(async () => {
  const res = execSync('pm2 list', { windowsHide: true });
  const logList = res.toString('utf-8').split('\n')
  // console.log(stdout.toString('utf-8'));
  console.log(logList);
  // updateGoalLineRuleList();
  // writeFileSync('./user.json', JSON.stringify({ userList: ac }), { encoding: 'utf-8' })
})();
