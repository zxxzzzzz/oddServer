import { server } from './server.js';
import { GlobalOptions, GoalLine, Result } from '../type/index.js';
import { GlobalFootballState, getChuanInfoList, getSinInfoList } from '../store/football.js';
import { getSinData, toNumber } from '../utils/index.js';
import { getAccountBySessionId } from '../store/user.js';
import * as cookie from 'cookie';



server.post('/api/water/getFootballData', async (req, res) => {
  const cookieObj = cookie.parse(req.header('cookie'));
  const userInfo = await getAccountBySessionId(cookieObj?.session_id || '');
  if (!userInfo) {
    res.send(405, {
      success: false,
      error: '请重新登录',
    });
    return;
  }
  const body = req.body;
  const op: GlobalOptions = {
    JCPointSin: parseFloat(body.JCPointSin || '0.12'),
    JCPointChuan: parseFloat(body.JCPointChuan || '0.13'),
    HGPoint: parseFloat(body.HGPoint || '0.023'),
    JCBet: parseFloat(body.JCTzAmt || '10000'),
    // "scope": "周三",
    // "outMatch": [],
    // "inMatch": []
  };
  const scope = body?.scope || '';
  const JCInfos = GlobalFootballState.JCInfoList.filter((jc) => jc.matchNumStr.includes(scope));
  const jcMatchIdList = JCInfos.map((v) => v.matchId);
  const HGInfos = GlobalFootballState.HGInfoList.filter((v) => jcMatchIdList.includes(v.matchId));
  const sinData = getSinInfoList(JCInfos as any[], HGInfos as any[], op).filter((sinInfo) => {
    // jc只选择了一个，可以通过
    if (!sinInfo.data.jcOdds1 || !sinInfo.data.jcOdds2) return true;
    // 去除jc里让球选择了两个的sin
    if (sinInfo.data.jcOdds1 && sinInfo.data.jcOdds2 && sinInfo.data.JCgoalLine1 !== '-') return false;
    if (sinInfo.data.jcOdds1 && sinInfo.data.jcOdds2 && sinInfo.data.JCgoalLine2 !== '-') return false;

    const finedJcInfo = JCInfos.find((jcInfo) => jcInfo.matchId === sinInfo.matchId);
    if (!finedJcInfo) return false;
    const minJcOdds = Math.min(toNumber(finedJcInfo.had_a), toNumber(finedJcInfo.had_d), toNumber(finedJcInfo.had_h));
    // 去除胜平负里选择了两个最大odds的sin
    if (
      sinInfo.data.jcOdds1 - minJcOdds !== 0 &&
      sinInfo.data.jcOdds2 - minJcOdds !== 0 &&
      sinInfo.data.JCgoalLine1 === '-' &&
      sinInfo.data.JCgoalLine2 === '-'
    )
      return false;
    return true;
  });
  const chuanData = getChuanInfoList(sinData, op)

  res.send({
    success: true,
    sinData: sinData,
    chuanData: chuanData,
    JCInfos,
    HGInfos,
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
          matchId: JCInfos[0].matchId,
          matchNumStr: '周日012',
          profitRate: '6.43%',
        },
      ],
      ftChuanList: [
        {
          matchId1: JCInfos[0].matchId,
          matchId2: JCInfos[1].matchId,
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

server.post('/api/water/caculateChuan', (req, res, next) => {
  res.send({
    success: true,
  });
  next();
});

server.get('/api/matchs/getMatchById', (req, res, next) => {
  const matchId = req.query?.matchId;
  const jcInfo = GlobalFootballState.JCInfoList.find((v) => v.matchId === matchId);
  const hgInfo = GlobalFootballState.HGInfoList.find((v) => v.matchId === matchId);
  res.send({
    success: true,
    data: {
      HGFootBoll: hgInfo,
      JCFootBoll: jcInfo,
    },
  });
  next();
});
