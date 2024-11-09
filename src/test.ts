import { readFileSync, writeFileSync } from 'fs';
import Convert from 'xml-js';
import {
  solveThreeVariableLinearEquations,
  updateGoalLineRuleList,
  getCoefficient,
  solveFourVariableLinearEquations,
  getMatchSinData,
  toAsyncTimeFunction,
  toFifoFunction,
} from './utils/index.js';
import { delay } from './api/utils.js';
import { randomUUID } from 'crypto';
// 运维接口
import { spawnSync, execSync } from 'child_process';




(async () => {
  // const res = execSync('pm2 list', { windowsHide: true });
  // const logList = res.toString('utf-8').split('\n')
  // console.log(stdout.toString('utf-8'));
  // console.log(logList);
  // updateGoalLineRuleList();
  // const data = JSON.parse(readFileSync('./cache/footballState.json', { encoding: 'utf-8' }))
  // const idList = data.JCInfoList.map(v => v.matchId)
  // const idList2 = data.HGInfoList.map(v => v.matchId)
  // console.log(idList.length, idList2.length);
})();
