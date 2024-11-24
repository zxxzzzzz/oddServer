import { existsSync, readFileSync, statSync, writeFileSync } from 'fs';
import Convert from 'xml-js';
import {
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
import { updateTokenIdleAge } from './store/hgAccount';

const updateAllRule = () => {
  const filePath = resolve(__dirname, '../cache/footballDataExample.json');
  console.log(filePath);
  if (!existsSync(filePath)) return;
  const data = JSON.parse(readFileSync(filePath, { encoding: 'utf-8' }));
  updateSinRuleList(data?.sinData || []);
  updateMethodRuleList(data?.sinData || []);
  updateChuanRuleList(data?.chuanData || []);
  console.log('update');
};

const getAllAccount = () => {
  const filePath = resolve(__dirname, '../cache/user.json');
  console.log(filePath);
  if (!existsSync(filePath)) return;
  const data = JSON.parse(readFileSync(filePath, { encoding: 'utf-8' })) as { userList: any[] };
  return (data.userList || []).map((item) => {
    return {
      account: item.account,
      password: item.password,
    };
  });
};

(async () => {
  updateAllRule();
  // updateTokenIdleAge()
  // console.log(getAllAccount());
  // 示例用法
  console.log(getLeagueSameWeight('瑞典超级甲组联赛-附加赛', '瑞典超级联赛'));
  console.log(getLeagueSameWeight('瑞典超级甲组联赛-附加赛', '瑞典甲组联赛-附加赛'));
})();
