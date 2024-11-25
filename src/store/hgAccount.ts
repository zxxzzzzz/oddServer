import { getLogFilePath, maxBy, minBy, toAsyncTimeFunction, toFifoFunction, toNumber } from '../utils/index';
import { loginByAccount } from '../api/login';
import { delay, uniqBy } from '../api/utils';
import { Token } from '../type';
import { existsSync, readFileSync } from 'fs';

const MIN_TOKEN_IDLE_AGE = 1000 * 1;

const GlobalAccountState: {
  accountList: { account: string; password: string }[];
  tokenList: Token[];
  isLogging: boolean;
  tokenIdleAge: number;
} = {
  accountList: [
    { account: 'CXGCXG717', password: 'ASd12345' },
    { account: 'CXGCXG719', password: 'ASd12345' },
    { account: 'CXGCXG720', password: 'ASd12345' },
    { account: 'CXGCXG721', password: 'ASd12345' },
    { account: 'CXGCXG723', password: 'ASd12345' },
  ],
  tokenList: [],
  isLogging: false,
  tokenIdleAge: MIN_TOKEN_IDLE_AGE,
};

export const updateTokenIdleAge = () => {
  const filePath = getLogFilePath('footballConsume');
  if (!existsSync(filePath)) return;
  const lineList = readFileSync(filePath, { encoding: 'utf-8' }).split('\n');
  if (lineList.length < 2) return;
  const [date, tag, duration] = (lineList.at(-2) || '').split(',').map((s) => s.trim());
  if (new Date().valueOf() - new Date(date).valueOf() > 1000 * 60 * 10) return;
  const durationNum = toNumber(duration) || MIN_TOKEN_IDLE_AGE;
  const offset = Math.abs(durationNum - 15000) / (durationNum + 15000);
  if (durationNum < 1000 * 15) {
    GlobalAccountState.tokenIdleAge = Math.round(GlobalAccountState.tokenIdleAge * (1 + offset));
  }
  if (durationNum > 1000 * 20) {
    const tokenIdleAge = Math.round(GlobalAccountState.tokenIdleAge * (1 - offset));
    GlobalAccountState.tokenIdleAge = Math.max(MIN_TOKEN_IDLE_AGE, tokenIdleAge);
  }
  console.log('tokenIdleAge', GlobalAccountState.tokenIdleAge / 1000 + ' s', 'lastDurationNum', durationNum / 1000 + ' s');
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
  toAsyncTimeFunction(
    async (): Promise<Token> => {
      while (GlobalAccountState.isLogging) {
        await delay(10);
      }
      if (GlobalAccountState.tokenList?.length !== GlobalAccountState.accountList?.length) {
        GlobalAccountState.isLogging = true;
        const aliveUrl = await getAliveUrl();
        if (!aliveUrl) throw Error('hg服务器连接不上');
        try {
          const noLoginAccountList = GlobalAccountState.accountList.filter((account) =>
            GlobalAccountState.tokenList.every((token) => token.account !== account.account)
          );
          for (const noLoginAccount of noLoginAccountList) {
            const token = await loginByAccount(noLoginAccount.account, noLoginAccount.password, aliveUrl);
            GlobalAccountState.tokenList = [
              ...GlobalAccountState.tokenList,
              { ...token, account: noLoginAccount.account, lastUseTimestamp: 0 },
            ];
          }
          GlobalAccountState.isLogging = false;
        } catch (error) {
          GlobalAccountState.isLogging = false;
        }
      }
      GlobalAccountState.tokenList = uniqBy(
        GlobalAccountState.tokenList.sort((a, b) => {
          return a.lastUseTimestamp - b.lastUseTimestamp;
        }),
        (el) => el.account
      );
      if (!GlobalAccountState.tokenList?.length) throw Error('hg账号 无法登录');
      const lastUseToken = GlobalAccountState.tokenList[0];
      const limitIdleAge = GlobalAccountState.tokenIdleAge;
      // 加个时间偏移
      const offset = Math.floor(Math.random() * limitIdleAge * 0.5);
      while (new Date().valueOf() - lastUseToken.lastUseTimestamp <= limitIdleAge + offset) {
        await delay(100);
      }
      lastUseToken.lastUseTimestamp = new Date().valueOf();
      return lastUseToken;
    },
    { tag: 'getToken', desc: '' }
  )
);
/**获取有多少个有效账号token */
export const getTokenCount = () => {
  return GlobalAccountState.tokenList.length || 0;
};
