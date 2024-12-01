import { getAccountBySessionId, isAccountVipExpired, login, logout, updateAccountBySessionId } from '../store/user';
import { server } from './server';
import { pickBy } from '../utils/lodash';
import * as cookie from 'cookie';

server.post('/api/users/login', async (req, res) => {
  const body = req.body;
  const account = body?.account;
  const password = body?.password;
  const isVipExpired = await isAccountVipExpired(account);
  if (isVipExpired) {
    res.send(400, {
      success: false,
      error: '该账号vip过期了',
    });
    return true;
  }
  const userInfo = await login(account, password);
  if (!userInfo) {
    res.send(400, {
      success: false,
      error: '请检查输入账号',
    });
    return true;
  }
  res.header('set-cookie', cookie.serialize('session_id', userInfo.pcsessionid, { maxAge: 60 * 60 * 24 * 3, httpOnly: true, path: '/' }));
  res.send({
    success: true,
    data: pickBy(userInfo, (v, k) =>
      [
        'id',
        'uuid',
        'account',
        'password',
        'name',
        'identificationcard',
        'company',
        'companyinfo',
        'sex',
        'email',
        'wechat',
        'photosrc',
        'role',
        'pcsessionid',
        'phonesessionid',
        'phone',
        'lastlogintime',
        'vip',
        'viptime',
        'keywords',
        'createdAt',
        'updatedAt',
      ].includes(k)
    ),
  });
});
server.get('/api/users/getme', async (req, res) => {
  const cookieObj = cookie.parse(req.header('cookie'));
  const userInfo = await getAccountBySessionId(cookieObj?.session_id || '');
  if (!userInfo) {
    res.send(400, {
      success: false,
      error: '请重新登录',
    });
    return;
  }
  res.send({
    success: true,
    data: pickBy(userInfo, (v, k) =>
      [
        'id',
        'uuid',
        'account',
        'name',
        'identificationcard',
        'company',
        'companyinfo',
        'sex',
        'email',
        'wechat',
        'photosrc',
        'role',
        'pcsessionid',
        'phonesessionid',
        'phone',
        'lastlogintime',
        'vip',
        'viptime',
        'keywords',
        'createdAt',
        'updatedAt',
      ].includes(k)
    ),
  });
});
server.get('/api/userConfig/getMyConfig', async (req, res) => {
  const cookieObj = cookie.parse(req.header('cookie'));
  const userInfo = await getAccountBySessionId(cookieObj?.session_id || '');
  if (!userInfo) {
    res.send(400, {
      success: false,
      error: '请重新登录',
    });
    return;
  }
  res.send({
    success: true,
    data: pickBy(userInfo, (v, k) =>
      [
        'id',
        'uuid',
        'userId',
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
    ),
  });
});

server.get('/api/chuanplan/findallback', async (req, res) => {
  const cookieObj = cookie.parse(req.header('cookie'));
  const userInfo = await getAccountBySessionId(cookieObj?.session_id || '');
  if (!userInfo) {
    res.send(405, {
      success: false,
      error: '请重新登录',
    });
    return;
  }
  const planList = userInfo?.planList || [];
  res.send({
    success: true,
    count: planList.length,
    pagination: {},
    data: planList,
  });
});

server.get('/api/notices/findall', (req, res, next) => {
  res.send({
    success: true,
    count: 1,
    pagination: {},
    data: [
      {
        id: 2,
        uuid: '0c7cc071-0c37-47fd-8469-926ba947e315',
        type: '1',
        text: '软件仅供参考，请仔细核对左侧比赛数据.',
        state: 'open',
        createdAt: '2023-10-12T11:10:40.000Z',
        updatedAt: '2024-10-19T17:36:29.000Z',
      },
    ],
  });
  next();
});

server.get('/api/jcmatch/version', (req, res, next) => {
  res.send({ success: true, value: '1.0.9057' });
  next();
});

server.post('/api/users/logout', async (req, res) => {
  const cookieObj = cookie.parse(req.header('cookie'));
  await logout(cookieObj?.session_id || '');
  res.send({ success: true, message: '登出成功' });
});

server.put('/api/userConfig/update/:uuid', async (req, res) => {
  const cookieObj = cookie.parse(req.header('cookie'));
  const body = req.body;
  await updateAccountBySessionId(cookieObj?.session_id || '', body);
  res.send({ success: true });
  return true;
});

server.get('/api/chuanplan/create', async (req, res) => {
  const body = req.body;
  const cookieObj = cookie.parse(req.header('cookie'));
  const userInfo = await getAccountBySessionId(cookieObj?.session_id || '');
  if (!userInfo) {
    res.send(405, {
      success: false,
      error: '请重新登录',
    });
    return;
  }
  updateAccountBySessionId(cookieObj?.session_id || '', { planList: [...userInfo.planList, body] });
  res.send({
    success: true,
  });
});
