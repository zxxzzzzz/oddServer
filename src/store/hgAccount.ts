import { maxBy, minBy, toAsyncTimeFunction, toFifoFunction } from '../utils/index.js';
import { loginByAccount } from '../api/login.js';
import { delay, uniqBy } from '../api/utils.js';
import ping from 'ping';

const GlobalAccountList = [
  { account: 'CXGCXG717', password: 'ASd12345' },
  { account: 'CXGCXG719', password: 'ASd12345' },
  { account: 'CXGCXG720', password: 'ASd12345' },
  { account: 'CXGCXG721', password: 'ASd12345' },
  { account: 'CXGCXG723', password: 'ASd12345' },
];
let GlobalTokenList: { uid: string; ver: string; url: string; lastUseTimestamp: number; account: string }[] = [];
// 是否正在登录
let isLogging = false;

/**获取存活的登录地址 */
export const getAliveUrl = async () => {
  const urlList = ['https://hga035.com/', 'https://123.108.119.118/'];
  const pList = urlList.map(async (url) => {
    const start = new Date().valueOf();
    try {
      await fetch(url, {
        headers: {
          accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
          'accept-language': 'zh-CN,zh;q=0.9',
          'cache-control': 'max-age=0',
          'content-type': 'application/x-www-form-urlencoded',
          'sec-ch-ua': '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"Windows"',
          'sec-fetch-dest': 'document',
          'sec-fetch-mode': 'navigate',
          'sec-fetch-site': 'same-origin',
          'sec-fetch-user': '?1',
          'upgrade-insecure-requests': '1',
          cookie: 'loadBB=WQ==; CookieChk=WQ; protocolstr=aHR0cHM=; cu=Tg==; cuipv6=Tg==; ipv6=Tg==',
          Referer: 'https://hga035.com/',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
        },
        body: 'detection=Y&sub_doubleLogin=',
        method: 'POST',
      });
    } catch (error) {
      return {
        url,
        networkQuality: Infinity,
      };
    }
    const end = new Date().valueOf();
    return {
      url,
      networkQuality: end - start,
    };
  });
  const resList = await Promise.all(pList);
  const item = minBy(resList, (item) => item.networkQuality);
  if (!item) return void 0;
  return item.url;
};

/**
 *
 * @param op limitIdleAge 空闲时间限制。token大于空闲时间的才会被返回
 * @returns
 */
export const getToken = toFifoFunction(
  toAsyncTimeFunction(async (op: { limitIdleAge: number } = { limitIdleAge: 1000 * 10 }) => {
    while (isLogging) {
      await delay(10);
    }
    if (!GlobalTokenList?.length) {
      isLogging = true;
      const aliveUrl = await getAliveUrl();
      if (!aliveUrl) throw Error('hg服务器连接不上');
      try {
        const noLoginAccountList = GlobalAccountList.filter((account) =>
          GlobalTokenList.every((token) => token.account !== account.account)
        );
        for (const noLoginAccount of noLoginAccountList) {
          const token = await loginByAccount(noLoginAccount.account, noLoginAccount.password, aliveUrl);
          GlobalTokenList = [...GlobalTokenList, { ...token, account: noLoginAccount.account, lastUseTimestamp: 0 }];
        }
        isLogging = false;
        // console.log(GlobalTokenList);
      } catch (error) {
        isLogging = false;
        // console.log(error);
      }
    }
    GlobalTokenList = uniqBy(
      GlobalTokenList.sort((a, b) => {
        return a.lastUseTimestamp - b.lastUseTimestamp;
      }),
      (el) => el.account
    );
    if (!GlobalTokenList?.length) throw Error('hg账号 无法登录');
    const lastUseToken = GlobalTokenList[0];
    // 加个时间偏移
    const offset = Math.floor(Math.random() * op.limitIdleAge * 0.5);
    while (new Date().valueOf() - lastUseToken.lastUseTimestamp <= op.limitIdleAge + offset) {
      await delay(100);
    }
    lastUseToken.lastUseTimestamp = new Date().valueOf();
    // console.log('token', lastUseToken.uid, new Date(lastUseToken.lastUseTimestamp).toISOString());
    return lastUseToken;
  }, 'getToken')
);
/**获取有多少个有效账号token */
export const getTokenCount = () => {
  return GlobalTokenList.length || 0;
};

export const reLogin = async (uid: string) => {
  const matchItem = GlobalTokenList.find((ac) => ac.uid === uid);
  if (!matchItem) return;
  const account = GlobalAccountList.find((ac) => ac.account === matchItem.account);
  if (!account) return;
  const aliveUrl = await getAliveUrl();
  if (!aliveUrl) throw new Error('hg 服务器连接不上');
  let i = 0;
  while (i < 3) {
    try {
      const token = await loginByAccount(account.account, account.password, aliveUrl);
      GlobalTokenList = [...GlobalTokenList, { ...token, account: account.account, lastUseTimestamp: 0 }];
      return;
    } catch (error) {}
  }
};
