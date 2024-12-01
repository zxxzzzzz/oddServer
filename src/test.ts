import { existsSync, mkdir, mkdirSync, readFileSync, statSync, writeFileSync } from 'fs';
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
  getTeamSameWeight,
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
  console.log(
    55555,
    sinList.filter((info) => info.matchId === '1028307' && info.data.profit >= 450)
  );
  console.log(
    4444,
    sinList.filter((v) => v.data.profit >= 450)
  );
  const chuanList = getChuanInfoList(sinList, { HGPoint: 0.023, JCBet: 10000, JCPointChuan: 0.14, JCPointSin: 0.12 });
  console.log(chuanList);
};

function generateRandomPassword(length: number = 8): string {
  const uppercaseLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercaseLetters = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';

  // 确保密码中至少包含一个大写字母、一个小写字母、一个数字和一个特殊字符
  const requiredCharacters = [getRandomCharacter(uppercaseLetters), getRandomCharacter(lowercaseLetters), getRandomCharacter(numbers)];

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

const saveAllStaticFile = async (pathList: string[]) => {
  fetch('http://129.211.223.119/static/js/jquery-1.11.3.min.js', {});

  for (const mpath of pathList) {
    const url = `http://129.211.223.119${mpath}`;
    console.log(url);
    const res = await fetch(url, {
      headers: {
        accept: '*/*',
        'accept-language': 'zh-CN,zh;q=0.9',
        'cache-control': 'no-cache',
        pragma: 'no-cache',
        'proxy-connection': 'keep-alive',
        cookie: 'session_id=s%3A2IXnd_oxTTL2GJ-NC2LfbMM7GgUEwzGy.2G0rUfICGMJ9SI2okV15lcGrxcH0qLMZQohCpZgmG7I',
        Referer: 'http://129.211.223.119/',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
      },
      body: null,
      method: 'GET',
    });
    const text = await res.text();
    const fileName = mpath.split('/').at(-1);
    const dirName = mpath.split('/').at(-2);
    if (!existsSync(`./web2/static/${dirName}`)) {
      mkdirSync(`./web2/static/${dirName}`, { recursive: true });
    }
    writeFileSync(`./web2/static/${dirName}/${fileName}`, text, { encoding: 'utf-8' });
    await delay(500)
  }
};

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
  // getTest(['1028307', '1028303']);
  // getCompareLeagueList();
  // '韩国K乙级联赛', '韩国职业联赛'
  // const jcHomeTeam = '墨尔本胜利';
  // const jcAwayTeam = '西部联';
  // const hgHomeTeam = '西方联';
  // const hgAwayTeam = '墨尔本胜利';
  // const homeWeight = getTeamSameWeight(jcHomeTeam, hgHomeTeam);
  // const homeReverseWeight = getTeamSameWeight(jcHomeTeam, hgAwayTeam);
  // const awayWeight = getTeamSameWeight(jcAwayTeam, hgAwayTeam);
  // const awayReverseWeight = getTeamSameWeight(jcAwayTeam, hgHomeTeam);
  // const isNeedReverseTeam = homeReverseWeight > homeWeight && awayReverseWeight > awayWeight;
  // console.log({ homeWeight, homeReverseWeight, awayReverseWeight, awayWeight, isNeedReverseTeam });
  console.log(getLeagueSameWeight('韩国K乙级联赛', '韩国职业联赛'));

  saveAllStaticFile([
    ...Object.entries({
      'chunk-07711831': '638799a4',
      'chunk-0aeae326': '549c5252',
      'chunk-21abca40': '64c8a0fa',
      'chunk-2815857a': 'a7b0e0df',
      'chunk-3e21a792': 'a5922c1f',
      'chunk-3f0588fc': '86eb0393',
      'chunk-41dfe85b': 'cd7c9dfb',
      'chunk-49990cc4': 'b31cd62f',
      'chunk-5b318488': '7b09cf9b',
      'chunk-66da1a61': 'ce0f2a60',
      'chunk-6db8ccd0': '36fb6b03',
      'chunk-7895deac': '65d658b5',
      'chunk-79fe1278': 'ce015e45',
      'chunk-ce5c3a5c': '29dde34e',
      'chunk-d4c1d6f4': '3e959b17',
      'chunk-edb7bca2': '46d92db6',
      'chunk-f82aeb04': '5b6d8809',
    }).map(([k, v]) => {
      return `/static/js/${k}.${v}.js`;
    }),
    ...Object.entries({
      'chunk-07711831': 'f6043cf5',
      'chunk-0aeae326': 'bb2153c9',
      'chunk-21abca40': 'c68f5e69',
      'chunk-2815857a': '476ce286',
      'chunk-3e21a792': '99e4d5d1',
      'chunk-3f0588fc': '8cfef481',
      'chunk-41dfe85b': 'e0c8cbb0',
      'chunk-49990cc4': '61eb9880',
      'chunk-5b318488': '75b0e3d4',
      'chunk-66da1a61': '46987287',
      'chunk-6db8ccd0': '72b36f83',
      'chunk-7895deac': '1dc70cca',
      'chunk-79fe1278': 'bfc85881',
      'chunk-ce5c3a5c': '5ed5589d',
      'chunk-d4c1d6f4': '157601f7',
      'chunk-edb7bca2': '213b70c2',
      'chunk-f82aeb04': '742d7e78',
    }).map(([k, v]) => {
      return `/static/css/${k}.${v}.css`;
    }),

    '/static/js/jquery-1.11.3.min.js',
    '/static/css/app.aadc14ed.css',
    '/static/css/chunk-elementUI.68c70ad5.css',
    '/static/css/chunk-libs.3dfb7769.css',
    '/static/js/app.7493e24a.js',
    '/static/js/chunk-elementUI.59a20057.js',
    '/static/js/chunk-libs.c1b47697.js',
    '/static/css/chunk-elementUI.68c70ad5.css',
    '/static/css/chunk-libs.3dfb7769.css',
    '/static/css/app.aadc14ed.css',

    '/static/js/chunk-elementUI.59a20057.js',
    '/static/js/chunk-libs.c1b47697.js',
    '/static/js/app.7493e24a.js',
  ]);
})();
