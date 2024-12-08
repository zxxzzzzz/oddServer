import { getLogFilePath, minBy, toAsyncTimeFunction, toFifoFunction, toNumber } from '../utils/index.ts';
import { loginByAccount } from '../api/login.ts';
import { delay } from '../api/utils.ts';
import { Token } from '../type/index.ts';
import { existsSync, readFileSync } from 'fs';
import dayjs from 'dayjs';

const MIN_TOKEN_IDLE_AGE = 1000 * 1;
const MAX_TOKEN_IDLE_AGE = 1000 * 10;
// const ZERO_TIME = '2000-11-08T05:55:26.881Z';

const GlobalAccountState: {
  accountList: { account: string; password: string }[];
  tokenList: Token[];
  tokenIdleAge: number;
} = {
  accountList: [
    { account: 'CXGCXG717', password: 'ASd12345' },
    { account: 'CXGCXG719', password: 'ASd12345' },
    { account: 'CXGCXG720', password: 'ASd12345' },
    { account: 'CXGCXG721', password: 'ASd12345' },
    { account: 'CXGCXG723', password: 'ASd12345' },
    { account: 'CXGCXG766', password: 'ASd12345' },
    // { account: 'CXGCXG767', password: 'ASd12345' },
  ],
  tokenList: [],
  tokenIdleAge: MIN_TOKEN_IDLE_AGE,
};

export const updateTokenIdleAge = () => {
  const filePath = getLogFilePath('footballConsume');
  if (!existsSync(filePath)) return;
  const lineList = readFileSync(filePath, { encoding: 'utf-8' }).split('\n');
  if (lineList.length < 2) return;
  const [date, _tag, duration] = (lineList.at(-2) || '').split(',').map((s) => s.trim());
  if (new Date().valueOf() - new Date(date).valueOf() > 1000 * 60 * 10) return;
  const durationNum = toNumber(duration) || MIN_TOKEN_IDLE_AGE;
  const offset = Math.abs(durationNum - 15000) / (durationNum + 15000);
  if (durationNum < 1000 * 15) {
    GlobalAccountState.tokenIdleAge = Math.min(Math.round(GlobalAccountState.tokenIdleAge * (1 + offset)), MAX_TOKEN_IDLE_AGE);
  }
  if (durationNum > 1000 * 20) {
    const tokenIdleAge = Math.round(GlobalAccountState.tokenIdleAge * (1 - offset));
    GlobalAccountState.tokenIdleAge = Math.max(MIN_TOKEN_IDLE_AGE, tokenIdleAge);
  }
  console.log(
    dayjs().format('YYYY-MM-DD HH:mm:ss'),
    'tokenIdleAge:',
    (GlobalAccountState.tokenIdleAge / 1000).toFixed(2) + 's',
    'lastDurationNum:',
    (durationNum / 1000).toFixed(2) + 's',
    'aliveAccount:',
    GlobalAccountState.tokenList
      .filter((t) => t.uid && t.uid !== 'default')
      .map((t) => t.account)
      .toSorted((v1, v2) => v1.localeCompare(v2))
      .join(',')
  );
};

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
    } catch (_error) {
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
  toAsyncTimeFunction(
    async (): Promise<Token & { reLogin: () => Promise<void> }> => {
      const noLoginAccountList = [...GlobalAccountState.accountList].filter((accountItem) => {
        const finedToken = GlobalAccountState.tokenList.find((t) => t.account === accountItem.account);
        if (!finedToken) return true;
        if (!finedToken.uid) return true;
        return false;
      });
      const noLoginAccountNameList = noLoginAccountList.map((t) => t.account);
      if (noLoginAccountList.length) {
        GlobalAccountState.tokenList = [
          ...GlobalAccountState.tokenList.filter((t) => !noLoginAccountNameList.includes(t.account)),
          ...noLoginAccountList.map((noLoginAccount) => {
            return {
              // default是一个占位，避免多次登录这个账号
              uid: 'default',
              url: '',
              ver: '',
              account: noLoginAccount.account,
              lastUseTimestamp: 0,
              loginTimestamp: new Date().valueOf(),
            };
          }),
        ];
        const aliveUrl = await getAliveUrl();
        if (!aliveUrl) throw Error('hg服务器连接不上');
        noLoginAccountList.forEach(async (noLoginAccount) => {
          const token = await loginByAccount(noLoginAccount.account, noLoginAccount.password, aliveUrl);
          console.log(dayjs().format('YYYY-MM-DD HH:mm:ss'), 'login account', noLoginAccount.account);
          GlobalAccountState.tokenList = [
            ...GlobalAccountState.tokenList.filter((token) => token.account !== noLoginAccount.account),
            { ...token, account: noLoginAccount.account, lastUseTimestamp: 0, loginTimestamp: new Date().valueOf() },
          ];
        });
      }
      while (true) {
        await delay(100);
        GlobalAccountState.tokenList = GlobalAccountState.tokenList.toSorted((v1, v2) => {
          return v1.lastUseTimestamp - v2.lastUseTimestamp;
        });
        const filteredTokenList = GlobalAccountState.tokenList.filter((token) => {
          return token?.uid && token?.uid !== 'default';
        });
        if (!filteredTokenList?.length) continue;
        const lastUseToken = filteredTokenList[0];
        const limitIdleAge = GlobalAccountState.tokenIdleAge;
        if (new Date().valueOf() - lastUseToken.lastUseTimestamp <= limitIdleAge) {
          continue;
        }
        lastUseToken.lastUseTimestamp = new Date().valueOf();
        return {
          ...lastUseToken,
          reLogin: (async (accountName: string) => {
            const token = GlobalAccountState.tokenList.find((t) => t.account === accountName);
            if (!token || token.uid === 'default' || new Date().valueOf() - token.loginTimestamp <= 1000 * 60) return;
            token.uid = '';
            await delay(10)
          }).bind(null, lastUseToken.account),
        };
      }
    },
    {
      tag: 'getToken',
      desc: (_, re) =>
        `name:${re.account} login:${dayjs(re.loginTimestamp).format('YYYY-MM-DD HH:mm:ss')} use:${dayjs(re.lastUseTimestamp).format('YYYY-MM-DD HH:mm:ss')}`,
    }
  )
);
/**获取有多少个有效账号token */
export const getTokenCount = () => {
  return GlobalAccountState.tokenList.length || 0;
};
