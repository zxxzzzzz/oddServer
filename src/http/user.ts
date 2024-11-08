import { getAccountBySessionId, login, updateAccountBySessionId } from '../store/user.js';
import { server } from './server.js';
import { pickBy } from '../utils/lodash.js';
import * as cookie from 'cookie';

server.post('/api/users/login', (req, res, next) => {
  const body = req.body;
  const account = body?.account;
  const password = body?.password;
  const userInfo = login(account, password);
  if (!userInfo) {
    res.send(400, {
      success: false,
      error: '请检查输入账号',
    });
    return;
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
  next();
});
server.get('/api/users/getme', (req, res, next) => {
  const cookieObj = cookie.parse(req.header('cookie'));
  const userInfo = getAccountBySessionId(cookieObj?.session_id || '');
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
  next();
});
server.get('/api/userConfig/getMyConfig', (req, res, next) => {
  const cookieObj = cookie.parse(req.header('cookie'));
  const userInfo = getAccountBySessionId(cookieObj?.session_id || '');
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
  next();
});
server.get('/api/chuanplan/findallback', (req, res, next) => {
  res.send({
    success: true,
    count: 7,
    pagination: {},
    data: [
      {
        id: 19054,
        uuid: '81ece75e-33a7-4a68-935d-d4fdd4f34851',
        userId: 'fe8efcdc-a815-480a-96d9-406c6e497805',
        planId: '周六001让负1.87%0A周六026让胜2.8',
        matchId1: '1027166',
        matchId2: '1027191',
        flag: 'saved',
        JCPoint: '0.13',
        HGPoint: '0.023',
        method1: 'WL',
        method2: 'D2',
        JCgoalLine1: '-1',
        JCgoalLine2: '-1',
        HGgoalLine1_1: '-',
        HGgoalLine1_2: '',
        HGgoalLine2_1: '-1',
        HGgoalLine2_2: 'J1',
        JCTouz1: 'a',
        JCTouz2: 'h',
        HGTouz1_1: 'h',
        HGTouz1_2: '',
        HGTouz2_1: 'a',
        HGTouz2_2: 'h',
        JCTzOdd1: '1.87',
        JCTzOdd2: '2.8',
        HGTzOdd1_1: '1.97',
        HGTzOdd1_2: '0',
        HGTzOdd2_1: '1.78',
        HGTzOdd2_2: '4.05',
        JCTzAmt: '10000',
        HGTzAmt1_1: '9102.3490',
        HGTzAmt1_2: '0',
        HGTzAmt2_1: '29500.2535',
        HGTzAmt2_2: '5745.1346',
        JcProfit: '332.2608',
        HgProfit1: '332.2608',
        HgProfit2: '332.2608',
        JCAmount: '52360.0000',
        HGAmount1_1: '17931.6275',
        HGAmount1_2: '0',
        HGAmount2_1: '52510.4512',
        HGAmount2_2: '23267.7951',
        yield: 'Sin',
        ifAverg: true,
        JcProfitRate: '3.3226%',
        Marks: '',
        firStar: false,
        secStar: null,
        delFlag: true,
        updateTime: null,
        createdAt: '2024-09-28T06:23:26.000Z',
        updatedAt: '2024-09-28T06:23:26.000Z',
      },
      {
        id: 19063,
        uuid: '3ae0ddf4-1a9f-4e46-b087-623185b6aecc',
        userId: 'fe8efcdc-a815-480a-96d9-406c6e497805',
        planId: '周六001让负1.92%0A周六026让胜2.8',
        matchId1: '1027166',
        matchId2: '1027191',
        flag: 'saved',
        JCPoint: '0.12',
        HGPoint: '0.023',
        method1: 'WL',
        method2: 'D2',
        JCgoalLine1: '-1',
        JCgoalLine2: '-1',
        HGgoalLine1_1: '-',
        HGgoalLine1_2: '',
        HGgoalLine2_1: '-1',
        HGgoalLine2_2: 'J1',
        JCTouz1: 'a',
        JCTouz2: 'h',
        HGTouz1_1: 'h',
        HGTouz1_2: '',
        HGTouz2_1: 'a',
        HGTouz2_2: 'h',
        JCTzOdd1: '1.92',
        JCTzOdd2: '2.8',
        HGTzOdd1_1: '1.97',
        HGTzOdd1_2: '0',
        HGTzOdd2_1: '1.78',
        HGTzOdd2_2: '4.05',
        JCTzAmt: '40000',
        HGTzAmt1_1: '37382.9092',
        HGTzAmt1_2: '0',
        HGTzAmt2_1: '121156.1215',
        HGTzAmt2_2: '23594.9911',
        JcProfit: '1895.0607',
        HgProfit1: '1895.0607',
        HgProfit2: '1895.0607',
        JCAmount: '215040.0000',
        HGAmount1_1: '73644.3311',
        HGAmount1_2: '0',
        HGAmount2_1: '215657.8963',
        HGAmount2_2: '95559.7140',
        yield: 'Sin',
        ifAverg: true,
        JcProfitRate: '3.3226%',
        Marks: '',
        firStar: false,
        secStar: null,
        delFlag: true,
        updateTime: null,
        createdAt: '2024-09-28T06:31:06.000Z',
        updatedAt: '2024-09-28T06:31:06.000Z',
      },
      {
        id: 19071,
        uuid: '724d713e-1fae-4ce8-a134-fbe0af56bf7e',
        userId: 'fe8efcdc-a815-480a-96d9-406c6e497805',
        planId: '周六011让负2.23%0A周六019让负1.86',
        matchId1: '1027176',
        matchId2: '1027184',
        flag: 'saved',
        JCPoint: '0.13',
        HGPoint: '0.023',
        method1: 'WH2',
        method2: 'WL',
        JCgoalLine1: '-1',
        JCgoalLine2: '-1',
        HGgoalLine1_1: '-0.75',
        HGgoalLine1_2: 'J1',
        HGgoalLine2_1: '-',
        HGgoalLine2_2: '',
        JCTouz1: 'a',
        JCTouz2: 'a',
        HGTouz1_1: 'h',
        HGTouz1_2: 'h',
        HGTouz2_1: 'h',
        HGTouz2_2: '',
        JCTzOdd1: '2.23',
        JCTzOdd2: '1.86',
        HGTzOdd1_1: '1.9',
        HGTzOdd1_2: '3.9',
        HGTzOdd2_1: '2.03',
        HGTzOdd2_2: '0',
        JCTzAmt: '10000',
        HGTzAmt1_1: '11341.2125',
        HGTzAmt1_2: '1323.8718',
        HGTzAmt2_1: '20425.4691',
        HGTzAmt2_2: '0',
        JcProfit: '448.5294',
        HgProfit1: '448.5294',
        HgProfit2: '448.5294',
        JCAmount: '41478.0000',
        HGAmount1_1: '21548.3037',
        HGAmount1_2: '5163.1000',
        HGAmount2_1: '41463.7023',
        HGAmount2_2: '0',
        yield: 'Sin',
        ifAverg: true,
        JcProfitRate: '4.4853%',
        Marks: '',
        firStar: false,
        secStar: null,
        delFlag: true,
        updateTime: null,
        createdAt: '2024-09-28T06:42:34.000Z',
        updatedAt: '2024-09-28T06:42:34.000Z',
      },
      {
        id: 19072,
        uuid: 'e8819201-031b-4b97-b515-de8173d382e5',
        userId: 'fe8efcdc-a815-480a-96d9-406c6e497805',
        planId: '周六007让负2.92%0A周六019让负1.86',
        matchId1: '1027172',
        matchId2: '1027184',
        flag: 'saved',
        JCPoint: '0.13',
        HGPoint: '0.023',
        method1: 'D2',
        method2: 'WL',
        JCgoalLine1: '-1',
        JCgoalLine2: '-1',
        HGgoalLine1_1: '-1',
        HGgoalLine1_2: 'J1',
        HGgoalLine2_1: '-',
        HGgoalLine2_2: '',
        JCTouz1: 'a',
        JCTouz2: 'a',
        HGTouz1_1: 'h',
        HGTouz1_2: 'h',
        HGTouz2_1: 'h',
        HGTouz2_2: '',
        JCTzOdd1: '2.92',
        JCTzOdd2: '1.86',
        HGTzOdd1_1: '1.72',
        HGTzOdd1_2: '4',
        HGTzOdd2_1: '2.03',
        HGTzOdd2_2: '0',
        JCTzAmt: '40000',
        HGTzAmt1_1: '65783.3212',
        HGTzAmt1_2: '11976.2819',
        HGTzAmt2_1: '106981.8289',
        HGTzAmt2_2: '0',
        JcProfit: '1955.6210',
        HgProfit1: '1955.6210',
        HgProfit2: '1955.6210',
        JCAmount: '217248.0000',
        HGAmount1_1: '113147.3125',
        HGAmount1_2: '47905.1276',
        HGAmount2_1: '217173.1127',
        HGAmount2_2: '0',
        yield: 'Sin',
        ifAverg: true,
        JcProfitRate: '4.8891%',
        Marks: '',
        firStar: false,
        secStar: null,
        delFlag: true,
        updateTime: null,
        createdAt: '2024-09-28T06:43:51.000Z',
        updatedAt: '2024-09-28T06:46:23.000Z',
      },
      {
        id: 19135,
        uuid: 'd6d37e66-4387-42df-8257-755ecf44d0db',
        userId: 'fe8efcdc-a815-480a-96d9-406c6e497805',
        planId: '周六011让负2.1%0A周六026让胜2.75',
        matchId1: '1027176',
        matchId2: '1027191',
        flag: 'saved',
        JCPoint: '0.12',
        HGPoint: '0.023',
        method1: 'WL',
        method2: 'D2',
        JCgoalLine1: '-1',
        JCgoalLine2: '-1',
        HGgoalLine1_1: '-',
        HGgoalLine1_2: '',
        HGgoalLine2_1: '-1',
        HGgoalLine2_2: 'J1',
        JCTouz1: 'a',
        JCTouz2: 'h',
        HGTouz1_1: 'h',
        HGTouz1_2: '',
        HGTouz2_1: 'a',
        HGTouz2_2: 'h',
        JCTzOdd1: '2.1',
        JCTzOdd2: '2.75',
        HGTzOdd1_1: '1.83',
        HGTzOdd1_2: '0',
        HGTzOdd2_1: '1.8',
        HGTzOdd2_2: '4.1',
        JCTzAmt: '40000',
        HGTzAmt1_1: '44081.8438',
        HGTzAmt1_2: '0',
        HGTzAmt2_1: '128662.1366',
        HGTzAmt2_2: '25383.0476',
        JcProfit: '2229.8936',
        HgProfit1: '2229.8936',
        HgProfit2: '2229.8936',
        JCAmount: '231000.0000',
        HGAmount1_1: '80669.7742',
        HGAmount1_2: '0',
        HGAmount2_1: '231591.8459',
        HGAmount2_2: '104070.4952',
        yield: 'Sin',
        ifAverg: true,
        JcProfitRate: '6.5747%',
        Marks: '',
        firStar: false,
        secStar: null,
        delFlag: true,
        updateTime: null,
        createdAt: '2024-09-28T07:55:24.000Z',
        updatedAt: '2024-09-28T07:55:24.000Z',
      },
      {
        id: 19301,
        uuid: '41a35796-eb21-4793-a353-8c5aaa285a11',
        userId: 'fe8efcdc-a815-480a-96d9-406c6e497805',
        planId: '周日011让负2.23%0A周日018让胜1.51',
        matchId1: '1027202',
        matchId2: '1027209',
        flag: 'saved',
        JCPoint: '0.13',
        HGPoint: '0.023',
        method1: 'WL',
        method2: 'WL',
        JCgoalLine1: '-1',
        JCgoalLine2: '+1',
        HGgoalLine1_1: '-',
        HGgoalLine1_2: '',
        HGgoalLine2_1: '-',
        HGgoalLine2_2: '',
        JCTouz1: 'a',
        JCTouz2: 'h',
        HGTouz1_1: 'h',
        HGTouz1_2: '',
        HGTouz2_1: 'a',
        HGTouz2_2: '',
        JCTzOdd1: '2.23',
        JCTzOdd2: '1.51',
        HGTzOdd1_1: '1.75',
        HGTzOdd1_2: '0',
        HGTzOdd2_1: '2.61',
        HGTzOdd2_2: '0',
        JCTzAmt: '74000',
        HGTzAmt1_1: '89664.8276',
        HGTzAmt1_2: '0',
        HGTzAmt2_1: '94961.9665',
        HGTzAmt2_2: '0',
        JcProfit: '4419.8221',
        HgProfit1: '4419.8221',
        HgProfit2: '4419.8221',
        JCAmount: '249180.2000',
        HGAmount1_1: '156913.4483',
        HGAmount1_2: '0',
        HGAmount2_1: '247850.7326',
        HGAmount2_2: '0',
        yield: 'Sin',
        ifAverg: true,
        JcProfitRate: '4.1256%',
        Marks: '',
        firStar: false,
        secStar: null,
        delFlag: true,
        updateTime: null,
        createdAt: '2024-09-29T04:35:07.000Z',
        updatedAt: '2024-09-29T04:35:17.000Z',
      },
      {
        id: 20164,
        uuid: '36d9df33-613d-4f56-9e33-f3ed40d89af2',
        userId: 'fe8efcdc-a815-480a-96d9-406c6e497805',
        planId: '周四004让负1.8%0A周四007让胜2.62',
        matchId1: '1027296',
        matchId2: '1027299',
        flag: 'saved',
        JCPoint: '0.13',
        HGPoint: '0.023',
        method1: 'WL',
        method2: 'WH2',
        JCgoalLine1: '-2',
        JCgoalLine2: '+1',
        HGgoalLine1_1: '-1.5',
        HGgoalLine1_2: '',
        HGgoalLine2_1: '0.75',
        HGgoalLine2_2: 'J1',
        JCTouz1: 'a',
        JCTouz2: 'h',
        HGTouz1_1: 'h',
        HGTouz1_2: '',
        HGTouz2_1: 'a',
        HGTouz2_2: 'a',
        JCTzOdd1: '1.8',
        JCTzOdd2: '2.62',
        HGTzOdd1_1: '2.04',
        HGTzOdd1_2: '0',
        HGTzOdd2_1: '1.75',
        HGTzOdd2_2: '3.15',
        JCTzAmt: '10000',
        HGTzAmt1_1: '8601.5543',
        HGTzAmt1_2: '0',
        HGTzAmt2_1: '27036.6336',
        HGTzAmt2_2: '3265.4010',
        JcProfit: '451.1936',
        HgProfit1: '451.1936',
        HgProfit2: '451.1936',
        JCAmount: '47160.0000',
        HGAmount1_1: '17547.1708',
        HGAmount1_2: '0',
        HGAmount2_1: '47314.1088',
        HGAmount2_2: '10286.0132',
        yield: 'Sin',
        ifAverg: true,
        JcProfitRate: '4.5119%',
        Marks: '',
        firStar: false,
        secStar: null,
        delFlag: true,
        updateTime: null,
        createdAt: '2024-10-10T12:45:01.000Z',
        updatedAt: '2024-10-10T12:45:01.000Z',
      },
    ].slice(0, 1),
  });
  next();
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

server.put('/api/userConfig/update/:uuid', (req, res, next) => {
  const cookieObj = cookie.parse(req.header('cookie'));
  const body = req.body;
  updateAccountBySessionId(cookieObj?.session_id || '', body);
  res.send({ success: true });
  next();
});
