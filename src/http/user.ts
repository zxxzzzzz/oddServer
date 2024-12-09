import { getAccountBySessionId, isAccountVipExpired, login, logout, updateAccountBySessionId } from '../store/user.ts';
import { router } from './router.ts';
import { pickBy, toNumber } from '../utils/index.ts';
import * as cookie from 'cookie';
import { ChuanPlan, GoalLine, Result } from '../type/index.ts';
import { randomUUID } from 'crypto';

router.post('/api/users/login', async (ctx) => {
  const body = await ctx.request.body.json();
  const account = body?.account;
  const password = body?.password;
  const isVipExpired = await isAccountVipExpired(account);
  const userInfo = await login(account, password);
  if (!userInfo) {
    ctx.response.status = 400;
    ctx.response.body = {
      success: false,
      error: '账号不存在或者密码错误',
    };
    return true;
  }
  if (isVipExpired) {
    ctx.response.status = 400;
    ctx.response.body = {
      success: false,
      error: '该账号vip过期了',
    };
    return true;
  }
  ctx.response.headers.set(
    'set-cookie',
    cookie.serialize('session_id', userInfo.pcsessionid, { maxAge: 60 * 60 * 24 * 3, httpOnly: true, path: '/' })
  );
  ctx.response.body = {
    success: true,
    data: pickBy(userInfo, (_v, k) =>
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
  };
});

router.get('/api/users/getme', async (ctx) => {
  const cookieObj = cookie.parse(ctx.request.headers.get('cookie') || '');
  const userInfo = await getAccountBySessionId(cookieObj?.session_id || '');
  if (!userInfo) {
    ctx.response.status = 400;
    ctx.response.body = {
      success: false,
      error: '请重新登录',
    };
    return;
  }
  ctx.response.body = {
    success: true,
    data: pickBy(userInfo, (_v, k) =>
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
  };
});

router.get('/api/userConfig/getMyConfig', async (ctx) => {
  const cookieObj = cookie.parse(ctx.request.headers.get('cookie') || '');
  const userInfo = await getAccountBySessionId(cookieObj?.session_id || '');
  if (!userInfo) {
    ctx.response.status = 400;
    ctx.response.body = {
      success: false,
      error: '请重新登录',
    };
    return;
  }
  ctx.response.body = {
    success: true,
    data: pickBy(userInfo, (_v, k) =>
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
  };
});

router.get('/api/chuanplan/findallback', async (ctx) => {
  const delFlag = toNumber(ctx.request.url.searchParams.get('delFlag') || '');
  const limit = toNumber(ctx.request.url.searchParams.get('limit') || '') || 999;
  // const query: { delFlag: string; sort: 'createdAt,ASC'; limit: string } = ;
  const cookieObj = cookie.parse(ctx.request.headers.get('cookie') || '');
  const userInfo = await getAccountBySessionId(cookieObj?.session_id || '');
  if (!userInfo) {
    ctx.response.status = 405;
    ctx.response.body = {
      success: false,
      error: '请重新登录',
    };
    return;
  }
  const planList = (userInfo?.planList || [])
    .filter((item) => {
      return toNumber(delFlag) === item.delFlag;
    })
    .toSorted((v1, v2) => {
      return new Date(v1.createdAt).valueOf() - new Date(v2.createdAt).valueOf();
    })
    .slice(0, limit);
  ctx.response.body = {
    success: true,
    count: planList.length,
    pagination: {},
    data: planList,
  };
});

router.get('/api/notices/findall', (ctx) => {
  ctx.response.body = {
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
  };
});

router.get('/api/jcmatch/version', (ctx) => {
  ctx.response.body = { success: true, value: '1.0.9057' };
});

router.post('/api/users/logout', async (ctx) => {
  const cookieObj = cookie.parse(ctx.request.headers.get('cookie') || '');
  await logout(cookieObj?.session_id || '');
  ctx.response.body = { success: true, message: '登出成功' };
});

router.put('/api/userConfig/update/:uuid', async (ctx) => {
  const cookieObj = cookie.parse(ctx.request.headers.get('cookie') || '');
  const body = await ctx.request.body.json();
  await updateAccountBySessionId(cookieObj?.session_id || '', body);
  ctx.response.body = { success: true };
});

router.delete('/api/chuanplan/deleteone/:uuid', async (ctx) => {
  const cookieObj = cookie.parse(ctx.request.headers.get('cookie') || '');
  const userInfo = await getAccountBySessionId(cookieObj?.session_id || '');
  if (!userInfo) {
    ctx.response.status = 405;
    ctx.response.body = {
      success: false,
      error: '请重新登录',
    };
    return;
  }
  const uuid = ctx.params?.uuid || '';
  const filteredItemList = (userInfo.planList || [])
    .map((item) => {
      const delFlag = item.uuid === uuid ? item.delFlag - 1 : item.delFlag;
      return { ...item, delFlag };
    })
    .filter((item): item is ChuanPlan => [0, 1].includes(item.delFlag));
  await updateAccountBySessionId(cookieObj?.session_id || '', { planList: filteredItemList });
  ctx.response.body = { success: true };
});

router.post('/api/chuanplan/create', async (ctx) => {
  type Body = {
    matchId1: string;
    matchId2: string;
    method1: string;
    method2: string;
    JCPoint: string;
    HGPoint: string;
    JCTzAmt: string;
    HGTzAmt1_1: string;
    HGTzAmt1_2: string;
    HGTzAmt2_1: string;
    HGTzAmt2_2: string;
    JcProfitRate: string;
    JcProfit: string;
    HgProfit1: string;
    HgProfit2: string;
    JCAmount: string;
    HGAmount1_1: string;
    HGAmount1_2: string;
    HGAmount2_1: string;
    HGAmount2_2: string;
    JCgoalLine1: GoalLine;
    JCgoalLine2: GoalLine;
    HGgoalLine1_1: GoalLine;
    HGgoalLine1_2: GoalLine;
    HGgoalLine2_1: GoalLine;
    HGgoalLine2_2: GoalLine;
    JCTzOdd1: string;
    JCTzOdd2: string;
    HGTzOdd1_1: string;
    HGTzOdd1_2: string;
    HGTzOdd2_1: string;
    HGTzOdd2_2: string;
    yield: 'Sin';
    planId: string;
    JCTouz1: Result;
    JCTouz2: Result;
    HGTouz1_1: Result;
    HGTouz1_2: Result;
    HGTouz2_1: Result;
    HGTouz2_2: Result;
    matchNumStr1: string;
    matchNumStr2: string;
    beis: string;
    JCTouzName1: string;
    JCTouzName2: string;
    ifAverg: boolean;
    firStar: number;
    secStar: number;
    Marks: string;
    planName1: string;
    planName2: string;
    flag: 'saved';
    uuid: null;
  };
  const body = (await ctx.request.body.json()) as Body;
  const cookieObj = cookie.parse(ctx.request.headers.get('cookie') || '');
  const userInfo = await getAccountBySessionId(cookieObj?.session_id || '');
  if (!userInfo) {
    ctx.response.status = 405;
    ctx.response.body = {
      success: false,
      error: '请重新登录',
    };
    return;
  }

  const planItem: ChuanPlan = {
    id: Math.round(Math.random() * 1000000),
    uuid: randomUUID(),
    userId: userInfo.uuid,
    planId: body.planId,
    matchId1: body.matchId1,
    matchId2: body.matchId2,
    flag: 'saved',
    JCPoint: body.JCPoint,
    HGPoint: body.HGPoint,
    method1: body.method1,
    method2: body.method2,
    JCgoalLine1: body.JCgoalLine1,
    JCgoalLine2: body.JCgoalLine2,
    HGgoalLine1_1: body.HGgoalLine1_1,
    HGgoalLine1_2: body.HGgoalLine1_2,
    HGgoalLine2_1: body.HGgoalLine2_1,
    HGgoalLine2_2: body.HGgoalLine2_2,
    JCTouz1: body.JCTouz1,
    JCTouz2: body.JCTouz2,
    HGTouz1_1: body.HGTouz1_1,
    HGTouz1_2: body.HGTouz1_2,
    HGTouz2_1: body.HGTouz2_1,
    HGTouz2_2: body.HGTouz2_2,
    JCTzOdd1: body.JCTzOdd1,
    JCTzOdd2: body.JCTzOdd2,
    HGTzOdd1_1: body.HGTzOdd1_1,
    HGTzOdd1_2: body.HGTzOdd1_2,
    HGTzOdd2_1: body.HGTzOdd2_1,
    HGTzOdd2_2: body.HGTzOdd2_2,
    JCTzAmt: body.JCTzAmt,
    HGTzAmt1_1: body.HGTzAmt1_1,
    HGTzAmt1_2: body.HGTzAmt1_2,
    HGTzAmt2_1: body.HGTzAmt2_1,
    HGTzAmt2_2: body.HGTzAmt2_2,
    JcProfit: body.JcProfit,
    HgProfit1: body.HgProfit1,
    HgProfit2: body.HgProfit2,
    JCAmount: body.JCAmount,
    HGAmount1_1: body.HGAmount1_1,
    HGAmount1_2: body.HGAmount2_1,
    HGAmount2_1: body.HGAmount2_1,
    HGAmount2_2: body.HGAmount2_2,
    yield: 'Sin',
    ifAverg: !!body.ifAverg,
    JcProfitRate: body.JcProfitRate,
    Marks: body.Marks,
    firStar: !!body.firStar,
    secStar: !!body.secStar,
    delFlag: 1,
    updateTime: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await updateAccountBySessionId(cookieObj?.session_id || '', { planList: [...(userInfo.planList || []), planItem] });
  ctx.response.body = {
    success: true,
  };
});
