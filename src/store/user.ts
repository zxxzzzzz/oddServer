import { existsSync, readFileSync, writeFileSync } from 'fs';
import { randomUUID } from 'crypto';
import { User } from '../type/index.ts';
import { resolve } from 'path';
import stringify from 'json-stringify-pretty-compact';

let GlobalUserInfo: { userList: User[] } = { userList: [] };
const STATE_FILE_PATH = resolve(import.meta.dirname || './', '../../persistentState/user.json');

async function getAccountList() {
  if (GlobalUserInfo.userList.length) return GlobalUserInfo.userList;
  const userInfo = await loadUser();
  GlobalUserInfo = userInfo;
  return GlobalUserInfo.userList;
}

export async function updateAccountBySessionId(sessionId: string, data: Partial<Omit<User, 'username'>>) {
  const user = await getAccountBySessionId(sessionId);
  if (user) {
    (Object.keys(data) as (keyof User)[]).forEach((k) => {
      const v = data[k];
      // @ts-expect-error kkk
      user[k] = v;
    });
    await saveUser();
  }
}

export async function getAccountBySessionId(sessionId: string) {
  const userList = await getAccountList();
  const user = userList.find((u) => u.pcsessionid && u.pcsessionid === sessionId);
  return user;
}

export async function login(username: string, password: string) {
  const userList = await getAccountList();
  const user = userList.find((u) => u.account === username && u.password === password);
  if (!user) return void 0;
  const token = randomUUID();
  user.pcsessionid = token;
  user.lastlogintime = new Date().toISOString();
  await saveUser();
  return user;
}
export async function logout(sessionId: string) {
  const user = await getAccountBySessionId(sessionId);
  if (!user) return;
  user.pcsessionid = '';
  await saveUser();
  return user;
}

/**更新足球数据到web */
export const saveUser = function () {
  writeFileSync(STATE_FILE_PATH, stringify(GlobalUserInfo));
};

export const loadUser = function (): typeof GlobalUserInfo {
  if (!existsSync(STATE_FILE_PATH)) return { userList: [] };
  const content = readFileSync(STATE_FILE_PATH, { encoding: 'utf-8' });
  const ossUserInfo = JSON.parse(content);
  return ossUserInfo;
};

export const isAccountVipExpired = async (accountNameOrSessionId: string) => {
  const userList = await getAccountList();
  const finedUser = userList.find((user) => user.account === accountNameOrSessionId || user.pcsessionid === accountNameOrSessionId);
  if (!finedUser) return true;
  const vipEndTimestamp = new Date(finedUser.viptime).valueOf();
  const nowTimestamp = new Date().valueOf();
  return vipEndTimestamp - nowTimestamp < 0;
};
