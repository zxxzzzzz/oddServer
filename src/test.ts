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
  for (let index = 0; index < 99999; index++) {
    const filePath = resolve(__dirname, `../history/${index}.json`);
    if (!existsSync(filePath)) continue;
    console.log(filePath);
    const data = JSON.parse(readFileSync(filePath, { encoding: 'utf-8' }));
    updateSinRuleList(data?.sinData || []);
    updateMethodRuleList(data?.sinData || []);
    updateChuanRuleList(data?.chuanData || []);
    console.log('update');
  }
};

const getAllAccount = () => {
  const filePath = resolve(__dirname, '../persistentState/user.json');
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
const getCompareLeagueList = () => {
  const filePath = resolve(__dirname, '../persistentState/footballState.json');
  console.log(filePath);
  if (!existsSync(filePath)) return;
  const data = JSON.parse(readFileSync(filePath, { encoding: 'utf-8' })) as { HGGameList: any[] };
  console.log(
    uniqBy(data.HGGameList, (item) => item.JCLeagueName + item.HGLeagueName).map((item) => {
      return {
        JCLeagueName: item.JCLeagueName,
        HGLeagueName: item.HGLeagueName,
      };
    })
  );
};

(async () => {
  updateAllRule();
  // updateTokenIdleAge()
  // console.log(getAllAccount());
  // 示例用法
  // '亚足联冠军精英联赛', '亚洲冠军联赛', '亚足联冠军联赛二'
  getCompareLeagueList();
  console.log(getLeagueSameWeight('亚足联冠军精英联赛', '亚洲冠军联赛'));
  console.log(getLeagueSameWeight('亚足联冠军联赛二', '亚洲冠军联赛'));
})();
