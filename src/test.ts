import { existsSync, readFileSync, statSync, writeFileSync } from 'fs';
import Convert from 'xml-js';
import {
  solveThreeVariableLinearEquations,
  updateSinRuleList,
  getCoefficient,
  getMatchSinData,
  toAsyncTimeFunction,
  toFifoFunction,
  pickBy,
  range,
  updateChuanRuleList,
  getLeagueSameWeight,
  zipBy,
} from './utils/index';
import { delay, uniqBy } from './api/utils';
import { randomUUID } from 'crypto';
// 运维接口
import { spawnSync, execSync } from 'child_process';
import { updateMethodRuleList } from './utils/methodRule';
import path, { resolve } from 'path';
import dayjs from 'dayjs';

const updateAllRule = () => {
  const filePath = resolve(__dirname, '../cache/footballDataExample.json')
  console.log(filePath);
  if(!existsSync(filePath)) return
  const data = JSON.parse(readFileSync(filePath, { encoding: 'utf-8' }));
  updateSinRuleList(data?.sinData || []);
  updateMethodRuleList(data?.sinData || []);
  updateChuanRuleList(data?.chuanData || []);
};

(async () => {
  updateAllRule();
  // 示例用法
  console.log(getLeagueSameWeight('瑞典超级甲组联赛-附加赛', '瑞典超级联赛'));
  console.log(getLeagueSameWeight('瑞典超级甲组联赛-附加赛', '瑞典甲组联赛-附加赛'));
})();
