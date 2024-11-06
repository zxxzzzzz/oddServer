import { readFileSync, writeFileSync } from 'fs';
import { randomUUID } from 'crypto';
import { User } from 'src/type/index.js';
import { pickBy } from 'src/utils/index.js';
import { resolve } from 'path';

let GlobalUserInfo: { userList: User[] } = { userList: [] };

function getAccountList() {
  if (GlobalUserInfo.userList?.length) return GlobalUserInfo.userList;
  const userInfo: { userList: User[] } = JSON.parse(readFileSync(resolve(import.meta.dirname, '../../cache/user.json'), { encoding: 'utf-8' }));
  GlobalUserInfo = userInfo;
  return userInfo.userList;
}

function updateAccount(sessionId: string, data: Partial<Omit<User, 'username'>>) {
  const user = getAccountBySessionId(sessionId);
  if (user) {
    (Object.keys(data) as (keyof User)[]).forEach((k) => {
      const v = data[k]
      // @ts-expect-error
      user[k] = v
    });
    writeFileSync(resolve(import.meta.dirname, '../../cache/user.json'), JSON.stringify(GlobalUserInfo));
  }
}

export function getAccountBySessionId(sessionId: string) {
  const user = getAccountList().find((u) => u.pcsessionid === sessionId);
  return user;
}

function login(username: string, password: string) {
  const user = getAccountList().find((u) => u.account === username && u.password === password);
  if (user) {
    const token = randomUUID();
    updateAccount(token, { pcsessionid: token });
    return token;
  }
}

function getAccountConfig(sessionId: string) {
  const user = getAccountBySessionId(sessionId);
  if (user) {
    return pickBy(user, (v, k) =>
      [
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
      ].includes(k)
    );
  }
}








