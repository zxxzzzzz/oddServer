import { maxBy, minBy, toAsyncTimeFunction, toFifoFunction } from 'src/utils/index.js';
import { loginByAccount } from '../api/login.js';
import { delay, uniqBy } from '../api/utils.js';
import ping from 'ping';

const GlobalAccountList = [
  { account: 'CXGCXG717', password: 'ASd12345' },
  { account: 'CXGCXG719', password: 'ASd12345' },
  { account: 'CXGCXG720', password: 'ASd12345' },
  { account: 'CXGCXG721', password: 'ASd12345' },
  { account: 'CXGCXG723', password: 'ASd12345' }
];
let GlobalTokenList: { uid: string; ver: string; url: string; lastUseTimestamp: number; account: string }[] = [];
// 是否正在登录
let isLogging = false;

/**获取存活的登录地址 */
const getAliveUrl = async () => {
  var hosts = [
    'hga035.com',
    // 'mos011.com',
    // 'mos022.com',
    // 'hga038.com',
    // 'hga050.com',
    // '199.26.100.166',
    // '199.26.100.170',
  ];
  const resList = await Promise.all(
    hosts.map(async (host) => {
      let res = await ping.promise.probe(host);
      return res;
    })
  );
  const minRes = minBy(
    resList.filter((res) => res.alive),
    (item) => item.avg
  );
  const url = 'https://' + minRes!.inputHost + '/';
  console.log('fast', url);
  return url;
};

/**
 *
 * @param op limitIdleAge 空闲时间限制。token大于空闲时间的才会被返回
 * @returns
 */
export const getToken = toFifoFunction(toAsyncTimeFunction(async (op: { limitIdleAge: number } = { limitIdleAge: 10000 }) => {
  while (isLogging) {
    await delay(10);
  }
  if (!GlobalTokenList?.length) {
    isLogging = true;
    const aliveUrl = await getAliveUrl();
    try {
      const noLoginAccountList = GlobalAccountList.filter((account) =>
        GlobalTokenList.every((token) => token.account !== account.account)
      );
      for (const noLoginAccount of noLoginAccountList) {
        const token = await loginByAccount(noLoginAccount.account, noLoginAccount.password, aliveUrl);
        GlobalTokenList = [...GlobalTokenList, { ...token, account: noLoginAccount.account, lastUseTimestamp: 0 }];
      }
      isLogging = false;
      console.log(GlobalTokenList);
    } catch (error) {
      isLogging = false;
      console.log(error);
    }
  }
  GlobalTokenList = uniqBy(
    GlobalTokenList.sort((a, b) => {
      return a.lastUseTimestamp - b.lastUseTimestamp;
    }),
    (el) => el.account
  );
  if (!GlobalTokenList?.length) throw Error('store account 无法登录');
  const lastUseToken = GlobalTokenList[0];
  while (new Date().valueOf() - lastUseToken.lastUseTimestamp <= op.limitIdleAge) {
    await delay(100);
  }
  lastUseToken.lastUseTimestamp = new Date().valueOf();
  // console.log('token', lastUseToken.uid, new Date(lastUseToken.lastUseTimestamp).toISOString());
  return lastUseToken;
}, 'getToken'));
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
  let i = 0;
  while (i < 3) {
    try {
      const token = await loginByAccount(account.account, account.password, aliveUrl);
      GlobalTokenList = [...GlobalTokenList, { ...token, account: account.account, lastUseTimestamp: 0 }];
      return;
    } catch (error) {}
  }
};
