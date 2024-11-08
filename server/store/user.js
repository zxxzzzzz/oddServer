import { readFileSync, writeFileSync } from 'fs';
import { randomUUID } from 'crypto';
import { pickBy } from '../utils/index.js';
import { resolve } from 'path';
let GlobalUserInfo = { userList: [] };
function getAccountList() {
    if (GlobalUserInfo.userList?.length)
        return GlobalUserInfo.userList;
    const userInfo = JSON.parse(readFileSync(resolve(import.meta.dirname, '../../cache/user.json'), { encoding: 'utf-8' }));
    GlobalUserInfo = userInfo;
    return userInfo.userList;
}
function updateAccount(sessionId, data) {
    const user = getAccountBySessionId(sessionId);
    if (user) {
        Object.keys(data).forEach((k) => {
            const v = data[k];
            user[k] = v;
        });
        writeFileSync(resolve(import.meta.dirname, '../../cache/user.json'), JSON.stringify(GlobalUserInfo));
    }
}
export function getAccountBySessionId(sessionId) {
    const user = getAccountList().find((u) => u.pcsessionid && u.pcsessionid === sessionId);
    return user;
}
export function login(username, password) {
    const user = getAccountList().find((u) => u.account === username && u.password === password);
    if (user) {
        const token = randomUUID();
        user.pcsessionid = token;
        user.lastlogintime = new Date().toISOString();
        writeFileSync(resolve(import.meta.dirname, '../../cache/user.json'), JSON.stringify(GlobalUserInfo));
        return user;
    }
}
function getAccountConfig(sessionId) {
    const user = getAccountBySessionId(sessionId);
    if (user) {
        return pickBy(user, (v, k) => [
            'JCPointSinHad',
            'JCPointChuanHad',
            'JCPointSinTgg',
            'JCPointSinHalf',
            'JCPointChuanQb',
            'JCPointSinLq',
            'JCPointChuanLq',
            'JCPointChuanLqQb',
            'HGPoint',
            'JCTzAmt',
            'minrate',
            'maxmultiple',
            'danRadio',
            'chuanRadio',
            'zjqsRadio',
            'bqcRadio',
            'qbRadio',
            'otherRadio',
            'danSwitch',
            'chuanSwitch',
            'zjqsSwitch',
            'bqcSwitch',
            'qbSwitch',
            'otherSwitch',
            'createdAt',
            'updatedAt',
        ].includes(k));
    }
}
