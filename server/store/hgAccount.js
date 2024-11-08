import { minBy, toAsyncTimeFunction, toFifoFunction } from '../utils/index.js';
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
let GlobalTokenList = [];
let isLogging = false;
const getAliveUrl = async () => {
    var hosts = [
        'hga035.com',
    ];
    const resList = await Promise.all(hosts.map(async (host) => {
        let res = await ping.promise.probe(host);
        return res;
    }));
    const minRes = minBy(resList.filter((res) => res.alive), (item) => item.avg);
    const url = 'https://' + minRes.inputHost + '/';
    console.log('fast', url);
    return url;
};
export const getToken = toFifoFunction(toAsyncTimeFunction(async (op = { limitIdleAge: 10000 }) => {
    while (isLogging) {
        await delay(10);
    }
    if (!GlobalTokenList?.length) {
        isLogging = true;
        const aliveUrl = await getAliveUrl();
        try {
            const noLoginAccountList = GlobalAccountList.filter((account) => GlobalTokenList.every((token) => token.account !== account.account));
            for (const noLoginAccount of noLoginAccountList) {
                const token = await loginByAccount(noLoginAccount.account, noLoginAccount.password, aliveUrl);
                GlobalTokenList = [...GlobalTokenList, { ...token, account: noLoginAccount.account, lastUseTimestamp: 0 }];
            }
            isLogging = false;
            console.log(GlobalTokenList);
        }
        catch (error) {
            isLogging = false;
            console.log(error);
        }
    }
    GlobalTokenList = uniqBy(GlobalTokenList.sort((a, b) => {
        return a.lastUseTimestamp - b.lastUseTimestamp;
    }), (el) => el.account);
    if (!GlobalTokenList?.length)
        throw Error('store account 无法登录');
    const lastUseToken = GlobalTokenList[0];
    while (new Date().valueOf() - lastUseToken.lastUseTimestamp <= op.limitIdleAge) {
        await delay(100);
    }
    lastUseToken.lastUseTimestamp = new Date().valueOf();
    return lastUseToken;
}, 'getToken'));
export const getTokenCount = () => {
    return GlobalTokenList.length || 0;
};
export const reLogin = async (uid) => {
    const matchItem = GlobalTokenList.find((ac) => ac.uid === uid);
    if (!matchItem)
        return;
    const account = GlobalAccountList.find((ac) => ac.account === matchItem.account);
    if (!account)
        return;
    const aliveUrl = await getAliveUrl();
    let i = 0;
    while (i < 3) {
        try {
            const token = await loginByAccount(account.account, account.password, aliveUrl);
            GlobalTokenList = [...GlobalTokenList, { ...token, account: account.account, lastUseTimestamp: 0 }];
            return;
        }
        catch (error) { }
    }
};
