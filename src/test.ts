import { existsSync, readFileSync, statSync, writeFileSync } from 'fs';
import Convert from 'xml-js';
import {
  solveThreeVariableLinearEquations,
  updateGoalLineRuleList,
  getCoefficient,
  solveFourVariableLinearEquations,
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
  // const res = execSync('pm2 list', { windowsHide: true });
  // const logList = res.toString('utf-8').split('\n')
  // console.log(stdout.toString('utf-8'));
  // console.log(logList);
  // updateGoalLineRuleList();
  // const data = JSON.parse(readFileSync('./cache/footballState.json', { encoding: 'utf-8' }))
  // const idList = data.JCInfoList.map(v => v.matchId)
  // const idList2 = data.HGInfoList.map(v => v.matchId)
  // console.log(idList.length, idList2.length);
  const filePath = range(0, 100)
    .map((i) => {
      return path.resolve(import.meta.dirname, `../log/performance-${dayjs().format('YYYY-MM-DD')}-p${i}.csv`);
    })
    .find((filePath) => {
      if (!existsSync(filePath)) return true;
      console.log(statSync(filePath).size / 1024 / 1024);
      if (statSync(filePath).size / 1024 / 1024 < 10) return true;
      return false;
    });
  console.log(filePath);
})();
