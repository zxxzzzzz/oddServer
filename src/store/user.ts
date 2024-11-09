import { readFileSync, writeFileSync } from 'fs';
import { randomUUID } from 'crypto';
import { User } from '../type/index.js';
import { pickBy, toAsyncTimeFunction } from '../utils/index.js';
import { resolve } from 'path';
import stringify from 'json-stringify-pretty-compact';
import { getOssClient } from '../api/oss.js';
import { delay } from '../api/utils.js';

let GlobalUserInfo: { userList: User[] } = { userList: [] };

async function getAccountList() {
  if (GlobalUserInfo.userList.length) return GlobalUserInfo.userList;
  for (let index = 0; index < 10; index++) {
    try {
      const userInfo = await getUserFromOss();
      GlobalUserInfo = userInfo;
      return GlobalUserInfo.userList;
    } catch (error) {}
    await delay(1000)
  }
  return GlobalUserInfo.userList;
}

export async function updateAccountBySessionId(sessionId: string, data: Partial<Omit<User, 'username'>>) {
  const user = await getAccountBySessionId(sessionId);
  if (user) {
    (Object.keys(data) as (keyof User)[]).forEach((k) => {
      const v = data[k];
      // @ts-expect-error
      user[k] = v;
    });
    await uploadUserToOss();
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
  if (user) {
    const token = randomUUID();
    user.pcsessionid = token;
    user.lastlogintime = new Date().toISOString();
    await uploadUserToOss();
    return user;
  }
}
export async function logout(sessionId: string) {
  const user = await getAccountBySessionId(sessionId);
  if (user) {
    user.pcsessionid = '';
    await uploadUserToOss();
    return user;
  }
}

/**更新足球数据到web */
export const uploadUserToOss = toAsyncTimeFunction(async function uploadFootballStateToOss() {
  const OSS_FILE_NAME = 'user.json';
  const ossClient = getOssClient();
  await ossClient.put(OSS_FILE_NAME, Buffer.from(stringify(GlobalUserInfo)));
  writeFileSync(resolve(import.meta.dirname, '../../cache/user.json'), stringify(GlobalUserInfo));
}, 'uploadUserToOss');

export const getUserFromOss = toAsyncTimeFunction(async function updateFootballStateFromOss(): Promise<typeof GlobalUserInfo> {
  const OSS_FILE_NAME = 'user.json';
  const ossClient = getOssClient();
  const res = await ossClient.get(OSS_FILE_NAME);
  const content = res.content;
  if (!content) throw Error('oss里没有user数据');
  const ossUserInfo = JSON.parse(content);
  return ossUserInfo;
}, 'updateUserFromOss');
