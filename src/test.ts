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
  getChuanInfoBySinInfo,
} from './utils/index';
import { delay, uniqBy } from './api/utils';
import { randomUUID } from 'crypto';
// 运维接口
import { spawnSync, execSync } from 'child_process';
import { updateMethodRuleList } from './utils/methodRule';
import path, { resolve } from 'path';
import dayjs from 'dayjs';
import { updateTokenIdleAge } from './store/hgAccount';
import { HGInfo, JCInfo } from './type';
import { getChuanInfoList, getSinInfoList } from './store/football';

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

const getTest = (matchIdList: string[]) => {
  const filePath = resolve(__dirname, '../persistentState/test1.json');
  console.log(filePath);
  if (!existsSync(filePath)) return;
  const data = JSON.parse(readFileSync(filePath, { encoding: 'utf-8' })) as { JCInfoList: JCInfo[]; HGInfoList: HGInfo[] };
  const { JCInfoList: jcInfoList, HGInfoList: hgInfoList } = data;
  const filterJcList = jcInfoList.filter((info) => matchIdList.includes(info.matchId));
  const sinList = getSinInfoList(filterJcList, hgInfoList, { HGPoint: 0.023, JCBet: 10000, JCPointChuan: 0.14, JCPointSin: 0.12 });
  console.log(55555, sinList.filter(info => info.matchId === '1028307' && info.data.profit >= 450));
  console.log(4444, sinList.filter(v => v.data.profit >= 450));
  const chuanList = getChuanInfoList(sinList, { HGPoint: 0.023, JCBet: 10000, JCPointChuan: 0.14, JCPointSin: 0.12 });
  console.log(chuanList);
};

function generateRandomPassword(length: number = 8): string {
  const uppercaseLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercaseLetters = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';

  // 确保密码中至少包含一个大写字母、一个小写字母、一个数字和一个特殊字符
  const requiredCharacters = [
    getRandomCharacter(uppercaseLetters),
    getRandomCharacter(lowercaseLetters),
    getRandomCharacter(numbers),
  ];

  // 如果长度小于 4，则无法满足要求
  if (length < 4) {
    throw new Error('Password length must be at least 4 characters.');
  }

  // 剩余的字符数
  const remainingLength = length - 3;

  // 所有可能的字符集合
  const allCharacters = uppercaseLetters + lowercaseLetters + numbers;

  // 生成剩余的字符
  const remainingCharacters = Array.from({ length: remainingLength }, () => getRandomCharacter(allCharacters));

  // 合并所有字符并打乱顺序
  const passwordArray = [...requiredCharacters, ...remainingCharacters].sort(() => Math.random() - 0.5);

  return passwordArray.join('');
}

function getRandomCharacter(characters: string): string {
  const randomIndex = Math.floor(Math.random() * characters.length);
  return characters[randomIndex];
}

const createAccount = () => {
  const list = range(810, 820).map((index) => {
    return {
      password: generateRandomPassword(8),
      id: '0',
      uuid: randomUUID(),
      account: `ft${index}`,
      name: '',
      identificationcard: '',
      company: '',
      companyinfo: '',
      sex: '',
      email: '',
      wechat: '',
      photosrc: '',
      role: 'user',
      pcsessionid: '',
      phonesessionid: '',
      phone: '',
      lastlogintime: '2024-11-30T09:12:26.883Z',
      vip: null,
      viptime: '2999-11-04T15:59:59.000Z',
      keywords: null,
      createdAt: '2024-09-21T12:48:39.000Z',
      updatedAt: '2024-10-24T11:08:20.000Z',
      JCPointSinHad: 0.12,
      JCPointChuanHad: 0.14,
      JCPointSinTgg: '0.07',
      JCPointSinHalf: '0.07',
      JCPointChuanQb: '0.07',
      JCPointSinLq: '0.07',
      JCPointChuanLq: '0.07',
      JCPointChuanLqQb: '0.07',
      HGPoint: 0.023,
      JCTzAmt: '10000',
      minrate: '0',
      maxmultiple: 10,
      danRadio: 1,
      chuanRadio: 2,
      zjqsRadio: 2,
      bqcRadio: 2,
      qbRadio: 2,
      otherRadio: 6,
      danSwitch: true,
      chuanSwitch: true,
      zjqsSwitch: true,
      bqcSwitch: true,
      qbSwitch: true,
      otherSwitch: true,
      JCPointSin: 0.12,
      JCPointChuan: 0.14,
      interval: 10,
      autoflash: true,
      scope: 'all',
      tiptone: true,
      outFootWall: false,
    };
  });
  writeFileSync('./ac.json', JSON.stringify(list), { encoding: 'utf-8' });
};

(async () => {
  // updateAllRule();
  // updateTokenIdleAge()
  // console.log(getAllAccount());
  // 示例用法
  // '亚足联冠军精英联赛', '亚洲冠军联赛', '亚足联冠军联赛二'
  // createAccount();
  // console.log(getAllAccount()); 
  getTest(['1028307', '1028303']);
  // getCompareLeagueList();
  console.log(getLeagueSameWeight('亚足联冠军精英联赛', '亚洲冠军联赛'));
  console.log(getLeagueSameWeight('亚足联冠军联赛二', '亚洲冠军联赛'));
})();
