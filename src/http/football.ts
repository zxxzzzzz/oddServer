import { server } from './server.js';
import { GlobalOptions, GoalLine, Result } from '../type/index.js';
import { GlobalFootballState, getSinInfoList } from '../store/football.js';
import { getSinData } from '../utils/index.js';
import { getAccountBySessionId } from '../store/user.js';
import * as cookie from 'cookie';


server.post('/api/water/getFootballData', async (req, res) => {
  const cookieObj = cookie.parse(req.header('cookie'));
  const userInfo = await getAccountBySessionId(cookieObj?.session_id || '');
  if (!userInfo) {
    res.send(400, {
      success: false,
      error: '请重新登录',
    });
    return;
  }
  const body = req.body;
  const op: GlobalOptions = {
    JCPointSin: parseFloat(body.JCPointSin || 0.12),
    JCPointChuan: parseFloat(body.JCPointChuan || 0.13),
    HGPoint: parseFloat(body.HGPoint || 0.023),
    JCBet: parseFloat(body.JCTzAmt || '10000'),
    // "scope": "周三",
    // "outMatch": [],
    // "inMatch": []
  };
  const scope = body?.scope || '';
  const JCInfos = GlobalFootballState.JCInfoList.filter((jc) => jc.matchNumStr.includes(scope));
  const jcMatchIdList = JCInfos.map((v) => v.matchId);
  const HGInfos = GlobalFootballState.HGInfoList.filter((v) => jcMatchIdList.includes(v.matchId));
  const sinData = getSinInfoList(JCInfos, HGInfos, op);

  res.send({
    success: true,
    sinData: sinData,
    chuanData: [
      {
        matchId1: '1027670',
        matchId2: '1027682',
        method1: 'D2',
        method2: 'WL',
        JCPoint: 0.13,
        HGPoint: 0.023,
        JCTzAmt: '10000',
        HGTzAmt1_1: '6935.9721',
        HGTzAmt1_2: '3107.6536',
        HGTzAmt2_1: '14170.7488',
        HGTzAmt2_2: 0,
        JcProfitRate: '0.4256%',
        JcProfit: '42.5561',
        HgProfit1: '42.5561',
        HgProfit2: '42.5561',
        JCAmount: '32400.0000',
        HGAmount1_1: '18449.6858',
        HGAmount1_2: '11653.7010',
        HGAmount2_1: '32309.3073',
        HGAmount2_2: 0,
        JCgoalLine1: '-',
        JCgoalLine2: '-1',
        HGgoalLine1_1: '0',
        HGgoalLine1_2: '-',
        HGgoalLine2_1: '-0.5',
        HGgoalLine2_2: '-',
        JCTzOdd1: '2.00',
        JCTzOdd2: '1.62',
        HGTzOdd1_1: '2.66',
        HGTzOdd1_2: '3.750',
        HGTzOdd2_1: '2.28',
        HGTzOdd2_2: '-',
        yield: 'Sin',
        planId: '1027670_2.00_1027682_1.62',
        JCTouz1: 'h',
        JCTouz2: 'a',
        HGTouz1_1: 'a',
        HGTouz1_2: 'd',
        HGTouz2_1: 'h',
        HGTouz2_2: '-',
      },
      {
        matchId1: '1027664',
        matchId2: '1027670',
        method1: 'D2',
        method2: 'D2',
        JCPoint: 0.13,
        HGPoint: 0.023,
        JCTzAmt: '10000',
        HGTzAmt1_1: '18939.4039',
        HGTzAmt1_2: '3901.5726',
        HGTzAmt2_1: '24671.0526',
        HGTzAmt2_2: '11053.9178',
        JcProfitRate: '0.8107%',
        JcProfit: '81.0699',
        HgProfit1: '81.0699',
        HgProfit2: '81.0699',
        JCAmount: '66000.0000',
        HGAmount1_1: '31250.0164',
        HGAmount1_2: '12485.0323',
        HGAmount2_1: '65624.9999',
        HGAmount2_2: '41452.1917',
        JCgoalLine1: '-',
        JCgoalLine2: '-',
        HGgoalLine1_1: '0',
        HGgoalLine1_2: '-',
        HGgoalLine2_1: '0',
        HGgoalLine2_2: '-',
        JCTzOdd1: '3.30',
        JCTzOdd2: '2.00',
        HGTzOdd1_1: '1.65',
        HGTzOdd1_2: '3.200',
        HGTzOdd2_1: '2.66',
        HGTzOdd2_2: '3.750',
        yield: 'Sin',
        planId: '1027664_3.30_1027670_2.00',
        JCTouz1: 'a',
        JCTouz2: 'h',
        HGTouz1_1: 'h',
        HGTouz1_2: 'd',
        HGTouz2_1: 'a',
        HGTouz2_2: 'd',
      },
      {
        matchId1: '1027664',
        matchId2: '1027678',
        method1: 'D2',
        method2: 'WL',
        JCPoint: 0.13,
        HGPoint: 0.023,
        JCTzAmt: '10000',
        HGTzAmt1_1: '18800.5427',
        HGTzAmt1_2: '3872.9668',
        HGTzAmt2_1: '49469.0818',
        HGTzAmt2_2: 0,
        JcProfitRate: '0.1669%',
        JcProfit: '16.6883',
        HgProfit1: '16.6883',
        HgProfit2: '16.6883',
        JCAmount: '79200.0000',
        HGAmount1_1: '31020.8955',
        HGAmount1_2: '12393.4938',
        HGAmount2_1: '79645.2217',
        HGAmount2_2: 0,
        JCgoalLine1: '-',
        JCgoalLine2: '+1',
        HGgoalLine1_1: '0',
        HGgoalLine1_2: '-',
        HGgoalLine2_1: '0.5',
        HGgoalLine2_2: '-',
        JCTzOdd1: '3.30',
        JCTzOdd2: '2.40',
        HGTzOdd1_1: '1.65',
        HGTzOdd1_2: '3.200',
        HGTzOdd2_1: '1.61',
        HGTzOdd2_2: '-',
        yield: 'Sin',
        planId: '1027664_3.30_1027678_2.40',
        JCTouz1: 'a',
        JCTouz2: 'h',
        HGTouz1_1: 'h',
        HGTouz1_2: 'd',
        HGTouz2_1: 'a',
        HGTouz2_2: '-',
      },
      {
        matchId1: '1027664',
        matchId2: '1027670',
        method1: 'WL',
        method2: 'D2',
        JCPoint: 0.13,
        HGPoint: 0.023,
        JCTzAmt: '10000',
        HGTzAmt1_1: '6955.8234',
        HGTzAmt1_2: 0,
        HGTzAmt2_1: '12335.5263',
        HGTzAmt2_2: '5526.9589',
        JcProfitRate: '0.5251%',
        JcProfit: '52.5125',
        HgProfit1: '52.5125',
        HgProfit2: '52.5125',
        JCAmount: '33000.0000',
        HGAmount1_1: '15511.4862',
        HGAmount1_2: 0,
        HGAmount2_1: '32812.5000',
        HGAmount2_2: '20726.0959',
        JCgoalLine1: '-1',
        JCgoalLine2: '-',
        HGgoalLine1_1: '-',
        HGgoalLine1_2: '-',
        HGgoalLine2_1: '0',
        HGgoalLine2_2: '-',
        JCTzOdd1: '1.65',
        JCTzOdd2: '2.00',
        HGTzOdd1_1: '2.230',
        HGTzOdd1_2: '-',
        HGTzOdd2_1: '2.66',
        HGTzOdd2_2: '3.750',
        yield: 'Sin',
        planId: '1027664_1.65_1027670_2.00',
        JCTouz1: 'a',
        JCTouz2: 'h',
        HGTouz1_1: 'h',
        HGTouz1_2: '-',
        HGTouz2_1: 'a',
        HGTouz2_2: 'd',
      },
    ],
    HGInfos,
    JCInfos,
    watData: {
      bsktList: [
        {
          matchId: '1027707',
          matchNumStr: '周六302',
          profitRate: '4.29%',
        },
        {
          matchId: '1027706',
          matchNumStr: '周六301',
          profitRate: '0.34%',
        },
      ],
      ftSinList: [
        {
          matchId: '1027696',
          matchNumStr: '周日012',
          profitRate: '6.43%',
        },
        {
          matchId: '1027670',
          matchNumStr: '周六008',
          profitRate: '5.39%',
        },
        {
          matchId: '1027664',
          matchNumStr: '周六002',
          profitRate: '5.21%',
        },
        {
          matchId: '1027678',
          matchNumStr: '周六016',
          profitRate: '4.64%',
        },
        {
          matchId: '1027688',
          matchNumStr: '周日004',
          profitRate: '4.60%',
        },
      ],
      ftChuanList: [
        {
          matchId1: '1027670',
          matchId2: '1027696',
          matchNumStr1: '周六008',
          matchNumStr2: '周日012',
          profitRate: '1.18%',
        },
        {
          matchId1: '1027678',
          matchId2: '1027696',
          matchNumStr1: '周六016',
          matchNumStr2: '周日012',
          profitRate: '0.47%',
        },
        {
          matchId1: '1027689',
          matchId2: '1027696',
          matchNumStr1: '周日005',
          matchNumStr2: '周日012',
          profitRate: '0.34%',
        },
        {
          matchId1: '1027696',
          matchId2: '1027699',
          matchNumStr1: '周日012',
          matchNumStr2: '周日015',
          profitRate: '0.27%',
        },
        {
          matchId1: '1027664',
          matchId2: '1027696',
          matchNumStr1: '周六002',
          matchNumStr2: '周日012',
          profitRate: '0.09%',
        },
      ],
      fttgList: [
        {
          matchId: '1027663',
          matchNumStr: '周六001',
          profitRate: '1.78%',
        },
        {
          matchId: '1027684',
          matchNumStr: '周六022',
          profitRate: '1.32%',
        },
        {
          matchId: '1027665',
          matchNumStr: '周六003',
          profitRate: '1.19%',
        },
        {
          matchId: '1027692',
          matchNumStr: '周日008',
          profitRate: '1.11%',
        },
        {
          matchId: '1027672',
          matchNumStr: '周六010',
          profitRate: '0.74%',
        },
      ],
      bqcList: [
        {
          matchId: '1027673',
          matchNumStr: '周六011',
          profitRate: '3.14%',
        },
        {
          matchId: '1027670',
          matchNumStr: '周六008',
          profitRate: '2.50%',
        },
      ],
    },
  });
});

server.post('/api/water/caculateSin', (req, res, next) => {
  type Body = {
    JCgoalLine1: GoalLine;
    JCgoalLine2: GoalLine;
    HGgoalLine1: GoalLine;
    HGgoalLine2: GoalLine;
    jcOdds1: string;
    jcOdds2: string;
    hgOdds1: string;
    hgOdds2: string;
    JCTouz1: Result;
    JCTouz2: Result;
    HGTouz1: Result;
    HGTouz2: Result;
    method: string;
    matchTimeFormat: string;
    jcBet1: string;
    jcBet2: string;
    hgBet1: string;
    hgBet2: string;
    JCPoint1: string;
    JCPoint2: string;
    HGPoint1: string;
    HGPoint2: string;
    jcAmount1: string;
    jcAmount2: string;
    hgAmount1: string;
    hgAmount2: string;
    ret: string;
    profit: string;
    profitRate: string;
    JCPoint: string;
    HGPoint: string;
    JCTzAmt: string;
  };
  const body: Body = req.body;
  const toNumber = (v: string) => (Number.isNaN(parseFloat(v)) ? 0 : parseFloat(v));
  const op: GlobalOptions = {
    JCBet: toNumber(body.jcBet1),
    JCPointChuan: 0,
    JCPointSin: toNumber(body.JCPoint),
    HGPoint: toNumber(body.HGPoint),
  };
  const sinData = getSinData(
    {
      jcResult1: body.JCTouz1 || '-',
      jcResult2: body.JCTouz2 || '-',
      hgResult1: body.HGTouz1 || '-',
      hgResult2: body.HGTouz2 || '-',
      jcGoalLine1: body.JCgoalLine1 || '-',
      jcGoalLine2: body.JCgoalLine2 || '-',
      hgGoalLine1: body.HGgoalLine1 || '-',
      hgGoalLine2: body.HGgoalLine2 || '-',
      jcOdds1: toNumber(body.jcOdds1),
      jcOdds2: toNumber(body.jcOdds2),
      hgOdds1: toNumber(body.hgOdds1),
      hgOdds2: toNumber(body.hgOdds2),
      matchTimeFormat: body.matchTimeFormat,
    },
    op
  );
  res.send({
    success: true,
    data: sinData,
  });
  next();
});
