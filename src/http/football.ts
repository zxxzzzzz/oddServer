import { router } from './router.ts';
import { PointOptions, GoalLine, Result } from '../type/index.ts';
import { getChuanInfoList, getSinInfoList, getFootballState, getGoalInfoList } from '../store/football.ts';
import { getChuanInfo, getSinData, maxBy, toNumber, zipBy } from '../utils/index.ts';
import { isAccountVipExpired } from '../store/user.ts';
import * as cookie from 'cookie';


router.post('/api/water/getFootballData', async (ctx) => {
  const cookieObj = cookie.parse(ctx.request.headers.get('cookie') || '');
  const isVipExpired = await isAccountVipExpired(cookieObj?.session_id || '');
  if (isVipExpired) {
    ctx.response.status = 405;
    ctx.response.body = {
      success: false,
      error: 'vip过期，请重新登录',
    };
    return;
  }
  const footballState = getFootballState();
  const body = await ctx.request.body.json();
  const op: PointOptions = {
    JCPointSin: parseFloat(body.JCPointSin || '0.12'),
    JCPointChuan: parseFloat(body.JCPointChuan || '0.13'),
    HGPoint: parseFloat(body.HGPoint || '0.023'),
    JCBet: parseFloat(body.JCTzAmt || '10000'),
    // "scope": "周三",
    // "outMatch": ["1028115"],
    // "inMatch": ["1028115"]
  };
  const scope = body?.scope || '';

  const outMatch: string[] = body.outMatch || [];
  const inMatch: string[] = body.inMatch || [];
  const JCInfos = footballState.JCInfoList.filter((jc) => jc.matchNumStr.includes(scope));
  const jcMatchIdList = JCInfos.map((v) => v.matchId);
  const HGInfos = footballState.HGInfoList.filter((v) => jcMatchIdList.includes(v.matchId));
  const sinData = getSinInfoList(JCInfos as any[], HGInfos as any[], op).filter((sinInfo) => {
    const jcBet = sinInfo.data.jcBet1 + sinInfo.data.jcBet2;
    const hgBet = sinInfo.data.hgBet1 + sinInfo.data.hgBet2;
    // hg投注不超过jc 6倍
    if (hgBet > jcBet * 6) return false;
    // 去除jc里让球选择了两个的sin
    if (sinInfo.data.jcOdds1 && sinInfo.data.jcOdds2 && sinInfo.data.JCgoalLine1 !== '-') return false;
    if (sinInfo.data.jcOdds1 && sinInfo.data.jcOdds2 && sinInfo.data.JCgoalLine2 !== '-') return false;

    const finedJcInfo = JCInfos.find((jcInfo) => jcInfo.matchId === sinInfo.matchId);
    if (!finedJcInfo) return false;
    const minJcOdds = Math.min(toNumber(finedJcInfo.had_a), toNumber(finedJcInfo.had_d), toNumber(finedJcInfo.had_h));
    // 去除胜平负里选择了两个最大odds的sin
    if (
      sinInfo.data.jcOdds2 !== 0 &&
      sinInfo.data.jcOdds1 - minJcOdds !== 0 &&
      sinInfo.data.jcOdds2 - minJcOdds !== 0 &&
      sinInfo.data.JCgoalLine1 === '-' &&
      sinInfo.data.JCgoalLine2 === '-'
    ) {
      return false;
    }
    return true;
  });
  const chuanData = zipBy(
    getChuanInfoList(sinData, op),
    (item) => `${item.matchId1},${item.JCgoalLine1},${item.JCTouz1},${item.matchId2},${item.JCgoalLine2},${item.JCTouz2}`
  )
    .map((item) => {
      const { value } = item;
      const info = maxBy(value, (item) => item.JcProfit);
      return info;
    })
    .filter((v) => !!v)
    .filter((info) => {
      const isOut = !outMatch.length ? false : outMatch.some((matchId) => info.matchId1 === matchId || info.matchId2 === matchId);
      const isIn = !inMatch.length ? true : inMatch.some((matchId) => info.matchId1 === matchId || info.matchId2 === matchId);
      return isIn && !isOut;
    });
  ctx.response.body = {
    success: true,
    sinData: sinData,
    chuanData: chuanData,
    JCInfos,
    HGInfos,
    watData: {
      bsktList: [],
      ftSinList: [],
      ftChuanList: [],
      fttgList: [],
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
  };
});

router.post('/api/water/caculateSin', async (ctx) => {
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
  const body: Body = await ctx.request.body.json();
  const op: PointOptions = {
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
  ctx.response.body = {
    success: true,
    data: sinData,
  };
});

router.post('/api/water/caculateChuan', async (ctx) => {
  type Body = {
    matchId1: string;
    matchId2: string;
    method1: string;
    method2: string;
    JCPoint: number;
    HGPoint: number;
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
    planName1: string;
    planName2: string;
  };
  const body = (await ctx.request.body.json()) as Body;
  const matchId1 = body.matchId1;
  const matchId2 = body.matchId2;
  const method1 = body.method1;
  const method2 = body.method2;
  const jcOdds1 = toNumber(body.JCTzOdd1);
  const jcOdds2 = toNumber(body.JCTzOdd2);
  const jcResult1 = body.JCTouz1;
  const jcResult2 = body.JCTouz2;
  const jcGoalLine1 = body.JCgoalLine1;
  const jcGoalLine2 = body.JCgoalLine2;
  const hgOdds1_1 = toNumber(body.HGTzOdd1_1);
  const hgOdds1_2 = toNumber(body.HGTzOdd1_2);
  const hgOdds2_1 = toNumber(body.HGTzOdd2_1);
  const hgOdds2_2 = toNumber(body.HGTzOdd2_2);
  const hgResult1_1 = body.HGTouz1_1;
  const hgResult1_2 = body.HGTouz1_2;
  const hgResult2_1 = body.HGTouz2_1;
  const hgResult2_2 = body.HGTouz2_2;
  const hgGoalLine1_1 = body.HGgoalLine1_1;
  const hgGoalLine1_2 = body.HGgoalLine1_2;
  const hgGoalLine2_1 = body.HGgoalLine2_1;
  const hgGoalLine2_2 = body.HGgoalLine2_2;
  const data = getChuanInfo(
    {
      matchId1,
      matchId2,
      method1,
      method2,
      jcOdds1,
      jcOdds2,
      jcResult1,
      jcResult2,
      jcGoalLine1,
      jcGoalLine2,
      hgOdds1_1,
      hgOdds1_2,
      hgOdds2_1,
      hgOdds2_2,
      hgResult1_1,
      hgResult1_2,
      hgResult2_1,
      hgResult2_2,
      hgGoalLine1_1,
      hgGoalLine1_2,
      hgGoalLine2_1,
      hgGoalLine2_2,
    },
    {
      JCPointChuan: toNumber(body.JCPoint),
      JCBet: toNumber(body.JCTzAmt),
      JCPointSin: toNumber(body.JCPoint),
      HGPoint: toNumber(body.HGPoint),
    }
  );
  ctx.response.body = {
    success: true,
    data,
  };
});

// router.get('/api/matchs/getMatchById', (ctx) => {
//   const footballState = getFootballState();
//   const matchId = req.query?.matchId;
//   const jcInfo = footballState.JCInfoList.find((v) => v.matchId === matchId);
//   const hgInfo = footballState.HGInfoList.find((v) => v.matchId === matchId);
//   res.send({
//     success: true,
//     data: {
//       HGFootBoll: hgInfo,
//       JCFootBoll: jcInfo,
//     },
//   });
//   next();
// });

router.post('/api/water/getFtTotalGoal', async (ctx) => {
  const cookieObj = cookie.parse(ctx.request.headers.get('cookie') || '');
  const isVipExpired = await isAccountVipExpired(cookieObj?.session_id || '');
  if (isVipExpired) {
    ctx.response.status = 405
    ctx.response.body = {
      success: false,
      error: 'vip过期，请重新登录',
    }
    return;
  }
  const body = await ctx.request.body.json();
  const op: PointOptions = {
    JCPointSin: parseFloat(body.JCPointSin || '0.12'),
    JCPointChuan: parseFloat(body.JCPointChuan || '0.13'),
    HGPoint: parseFloat(body.HGPoint || '0.023'),
    JCBet: parseFloat(body.JCTzAmt || '10000'),
    // "scope": "周三",
    // "outMatch": ["1028115"],
    // "inMatch": ["1028115"]
  };
  const scope = body?.scope || '';
  const footballState = getFootballState();

  const JCInfos = footballState.JCInfoList.filter((jc) => jc.matchNumStr.includes(scope));
  const jcMatchIdList = JCInfos.map((v) => v.matchId);
  const HGInfos = footballState.HGInfoList.filter((v) => jcMatchIdList.includes(v.matchId));
  const goalData = getGoalInfoList(JCInfos as any[], HGInfos as any[], op);
  ctx.response.body = {
    success: true,
    goalData,
    HGInfos: footballState.HGInfoList,
    JCInfos: footballState.JCInfoList,
    watData: {
      bsktList: [],
      ftSinList: [],
      ftChuanList: [],
      fttgList: [],
      bqcList: [],
    },
  };
});

