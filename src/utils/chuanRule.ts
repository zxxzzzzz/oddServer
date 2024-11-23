import { existsSync, readFileSync, writeFileSync } from 'fs';
import { ChuanInfo, ChuanRule, GlobalOptions, SinInfo } from '../type/index';
import { getGaussElimination, toFixNumber, toNumber, uniqBy } from './lodash';
import path from 'path';
import { getCoefficient } from './sinRule';

let GlobalChuanRuleList: ChuanRule[] = [];
const FILE_PATH = path.resolve(__dirname, '../../cache/chuanRule.csv');
const CSV_HEAD = ['jcGoalLine', 'jcResult', 'hgGoalLine1', 'hgResult1', 'hgGoalLine2', 'hgResult2'] as const;

export const updateChuanRuleList = (chuanInfoList: ChuanInfo[]) => {
  const newRuleList: ChuanRule[] = chuanInfoList
    .map((item) => {
      return [
        {
          jcGoalLine: item.JCgoalLine1,
          jcResult: item.JCTouz1,
          hgGoalLine1: item.HGgoalLine1_1,
          hgResult1: item.HGTouz1_1,
          hgGoalLine2: item.HGgoalLine1_2,
          hgResult2: item.HGTouz1_2,
        },
        {
          jcGoalLine: item.JCgoalLine2,
          jcResult: item.JCTouz2,
          hgGoalLine1: item.HGgoalLine2_1,
          hgResult1: item.HGTouz2_1,
          hgGoalLine2: item.HGgoalLine2_2,
          hgResult2: item.HGTouz2_2,
        },
      ];
    })
    .flat();
  const oldMethodRuleList = getChuanRuleList();

  const itemList = [...newRuleList, ...oldMethodRuleList];
  const uniqItemList = uniqBy(itemList, (item) => CSV_HEAD.map((key) => item[key]).join(',')).toSorted((v1, v2) => {
    const aIndex = toNumber(v1.jcGoalLine) * 1000 + toNumber(v1.hgGoalLine1) * 100 + toNumber(v1.hgGoalLine2);
    const bIndex = toNumber(v2.jcGoalLine) * 1000 + toNumber(v2.hgGoalLine1) * 100 + toNumber(v2.hgGoalLine2);
    return aIndex - bIndex;
  });
  writeFileSync(
    FILE_PATH,
    CSV_HEAD.map((key) => {
      if (key === 'jcGoalLine') return '竞彩让球线';
      if (key === 'jcResult') return '竞彩比赛结果';
      if (key === 'hgGoalLine1') return '皇冠让球线1';
      if (key === 'hgGoalLine2') return '皇冠让球线2';
      if (key === 'hgResult1') return '皇冠比赛结果1';
      if (key === 'hgResult2') return '皇冠比赛结果2';
      return key;
    }).join(',') + '\n',
    { encoding: 'utf-8' }
  );
  writeFileSync(
    FILE_PATH,
    uniqItemList
      .map((item) =>
        CSV_HEAD.map((key) => {
          const v = item[key];
          return v;
        }).join(',')
      )
      .join('\n'),
    { flag: 'a', encoding: 'utf-8' }
  );
};

export const getChuanRuleList = () => {
  if (GlobalChuanRuleList?.length) return GlobalChuanRuleList;
  if (!existsSync(FILE_PATH)) return [];
  const ruleList = readFileSync(FILE_PATH, { encoding: 'utf-8' })
    .replace(/\r\n/g, '\n')
    .split('\n')
    .slice(1)
    .map((line: string) => {
      const vList = line.split(',').map((v) => {
        return v;
      });
      return CSV_HEAD.reduce((re, key, index) => {
        const v = vList[index];
        return { ...re, [key]: v };
      }, {} as ChuanRule);
    });
  GlobalChuanRuleList = ruleList;
  return GlobalChuanRuleList;
};


export const getChuanInfo = (info1: SinInfo, info2: SinInfo, op: GlobalOptions) => {
  // a=hg1 b=hg2 c=hg3 d=hg4 e=profit
  const jcOdds1 = toNumber(info1.data.jcOdds1);
  const jcOdds2 = toNumber(info2.data.jcOdds1);
  const jcResult1 = info1.data.JCTouz1;
  const jcResult2 = info2.data.JCTouz1;
  const jcGoalLine1 = info1.data.JCgoalLine1;
  const jcGoalLine2 = info2.data.JCgoalLine1;
  const hgOdds1_1 = toNumber(info1.data.hgOdds1);
  const hgOdds1_2 = toNumber(info1.data.hgOdds2);
  const hgOdds2_1 = toNumber(info2.data.hgOdds1);
  const hgOdds2_2 = toNumber(info2.data.hgOdds2);
  const hgResult1_1 = info1.data.HGTouz1;
  const hgResult1_2 = info1.data.HGTouz2;
  const hgResult2_1 = info2.data.HGTouz1;
  const hgResult2_2 = info2.data.HGTouz2;
  const hgGoalLine1_1 = info1.data.HGgoalLine1;
  const hgGoalLine1_2 = info1.data.HGgoalLine2;
  const hgGoalLine2_1 = info2.data.HGgoalLine1;
  const hgGoalLine2_2 = info2.data.HGgoalLine2;

  // jc 等式
  const a1 = !hgOdds1_1
    ? 0
    : getCoefficient(
        { result: jcResult1, isJC: true, goalLine: jcGoalLine1 },
        { result: hgResult1_1, isJC: false, goalLine: hgGoalLine1_1, odds: hgOdds1_1 },
        op
      );
  const b1 = !hgOdds1_2
    ? 0
    : getCoefficient(
        { result: jcResult1, isJC: true, goalLine: jcGoalLine1 },
        { result: hgResult1_2, isJC: false, goalLine: hgGoalLine1_2, odds: hgOdds1_2 },
        op
      );
  const c1 = !hgOdds2_1
    ? 0
    : getCoefficient(
        { result: jcResult2, isJC: true, goalLine: jcGoalLine2 },
        { result: hgResult2_1, isJC: false, goalLine: hgGoalLine2_1, odds: hgOdds2_1 },
        op
      );
  const d1 = !hgOdds2_2
    ? 0
    : getCoefficient(
        { result: jcResult2, isJC: true, goalLine: jcGoalLine2 },
        { result: hgResult2_1, isJC: false, goalLine: hgGoalLine2_1, odds: hgOdds2_1 },
        op
      );
  const e1 = !hgOdds1_1 ? 0 : -1;
  const f1 = -(jcOdds1 * jcOdds2 - 1 + op.JCPointChuan) * op.JCBet;

  // hg1_1 等式
  const a2 = !hgOdds1_1
    ? 0
    : getCoefficient(
        { result: hgResult1_1, isJC: false, goalLine: hgGoalLine1_1 },
        { result: hgResult1_1, isJC: false, goalLine: hgGoalLine1_1, odds: hgOdds1_1 },
        op
      );
  const b2 = !hgOdds1_1
    ? 0
    : getCoefficient(
        { result: hgResult1_1, isJC: false, goalLine: hgGoalLine1_1 },
        { result: hgResult1_2, isJC: false, goalLine: hgGoalLine1_2, odds: hgOdds1_2 },
        op
      );
  const c2 = 0;
  const d2 = 0;
  const e2 = !hgOdds1_1 ? 0 : -1;
  const f2 = !hgOdds1_1
    ? 0
    : -getCoefficient(
        { result: hgResult1_1, isJC: false, goalLine: hgGoalLine1_1 },
        { result: jcResult1, isJC: true, goalLine: jcGoalLine1, odds: jcOdds1 },
        op
      ) * op.JCBet;

  // hg1_2等式
  const a3 = !hgOdds1_2
    ? 0
    : getCoefficient(
        { result: hgResult1_2, isJC: false, goalLine: hgGoalLine1_2 },
        { result: hgResult1_1, isJC: false, goalLine: hgGoalLine1_1, odds: hgOdds1_1 },
        op
      );
  const b3 = !hgOdds1_2
    ? 0
    : getCoefficient(
        { result: hgResult1_2, isJC: false, goalLine: hgGoalLine1_2 },
        { result: hgResult1_2, isJC: false, goalLine: hgGoalLine1_2, odds: hgOdds1_2 },
        op
      );
  const c3 = 0;
  const d3 = 0;
  const e3 = !hgOdds1_2 ? 0 : -1;
  const f3 = !hgOdds1_2
    ? 0
    : -getCoefficient(
        { result: hgResult1_2, isJC: false, goalLine: hgGoalLine1_2 },
        { result: jcResult1, isJC: true, goalLine: jcGoalLine1, odds: jcOdds1 },
        op
      ) * op.JCBet;

  // hg2_1等式
  const a4 = !hgOdds2_1
    ? 0
    : getCoefficient(
        { result: jcResult1, isJC: true, goalLine: jcGoalLine1 },
        { result: hgResult1_1, isJC: false, goalLine: hgGoalLine1_1, odds: hgOdds1_1 },
        op
      );
  const b4 = !hgOdds2_1
    ? 0
    : getCoefficient(
        { result: jcResult1, isJC: true, goalLine: jcGoalLine1 },
        { result: hgResult1_2, isJC: false, goalLine: hgGoalLine1_2, odds: hgOdds1_2 },
        op
      );
  const c4 = !hgOdds2_1
    ? 0
    : getCoefficient(
        { result: hgResult2_1, isJC: false, goalLine: hgGoalLine2_1 },
        { result: hgResult2_1, isJC: false, goalLine: hgGoalLine2_1, odds: hgOdds2_1 },
        op
      );
  const d4 = !hgOdds2_1
    ? 0
    : getCoefficient(
        { result: hgResult2_1, isJC: false, goalLine: hgGoalLine2_1 },
        { result: hgResult2_2, isJC: false, goalLine: hgGoalLine2_2, odds: hgOdds2_2 },
        op
      );
  const e4 = !hgOdds2_1 ? 0 : -1;
  const f4 = !hgOdds2_1
    ? 0
    : -getCoefficient(
        { result: hgResult2_1, isJC: false, goalLine: hgGoalLine2_1 },
        { result: jcResult2, isJC: true, goalLine: jcGoalLine2, odds: jcOdds2 },
        op
      ) * op.JCBet;

  // hg2等式
  const a5 = !hgOdds2_2
    ? 0
    : getCoefficient(
        { result: jcResult1, isJC: true, goalLine: jcGoalLine1 },
        { result: hgResult1_1, isJC: false, goalLine: hgGoalLine1_1, odds: hgOdds1_1 },
        op
      );
  const b5 = !hgOdds2_2
    ? 0
    : getCoefficient(
        { result: jcResult1, isJC: true, goalLine: jcGoalLine1 },
        { result: hgResult1_2, isJC: false, goalLine: hgGoalLine1_2, odds: hgOdds1_2 },
        op
      );
  const c5 = !hgOdds2_2
    ? 0
    : getCoefficient(
        { result: hgResult2_2, isJC: false, goalLine: hgGoalLine2_2 },
        { result: hgResult2_1, isJC: false, goalLine: hgGoalLine2_1, odds: hgOdds2_1 },
        op
      );
  const d5 = !hgOdds2_2
    ? 0
    : getCoefficient(
        { result: hgResult2_2, isJC: false, goalLine: hgGoalLine2_2 },
        { result: hgResult2_2, isJC: false, goalLine: hgGoalLine2_2, odds: hgOdds2_2 },
        op
      );
  const e5 = !hgOdds2_2 ? 0 : -1;
  const f5 = !hgOdds2_2
    ? 0
    : -getCoefficient(
        { result: hgResult2_2, isJC: false, goalLine: hgGoalLine2_2 },
        { result: jcResult2, isJC: true, goalLine: jcGoalLine2, odds: jcOdds2 },
        op
      ) * op.JCBet;

  const [hgBet1_1, hgBet1_2, hgBet2_1, hgBet2_2, profit] = getGaussElimination(
    [
      [a1, b1, c1, d1, e1],
      [a2, b2, c2, d2, e2],
      [a3, b3, c3, d3, e3],
      [a4, b4, c4, d4, e4],
      [a5, b5, c5, d5, e5],
    ],
    [f1, f2, f3, f4, f5]
  );
  return {
    matchId1: info1.matchId,
    matchId2: info2.matchId,
    method1: info1.data.method,
    method2: info2.data.method,
    JCPoint: op.JCPointChuan,
    HGPoint: op.HGPoint,
    JCTzAmt: op.JCBet,
    HGTzAmt1_1: toFixNumber(hgBet1_1, 3),
    HGTzAmt1_2: toFixNumber(hgBet1_2, 3),
    HGTzAmt2_1: toFixNumber(hgBet2_1, 3),
    HGTzAmt2_2: toFixNumber(hgBet2_2, 3),
    JcProfitRate: `${toFixNumber((profit / op.JCBet) * 100, 3)}%`,
    JcProfit: toFixNumber(profit, 3),
    HgProfit1: toFixNumber(profit, 3),
    HgProfit2: toFixNumber(profit, 3),
    JCAmount: toFixNumber(op.JCBet * jcOdds1 * jcOdds2, 3),
    HGAmount1_1: toFixNumber(hgBet1_1 * hgOdds1_1, 3),
    HGAmount1_2: toFixNumber(hgBet1_2 * hgOdds1_2, 3),
    HGAmount2_1: toFixNumber(hgBet2_1 * hgOdds2_1, 3),
    HGAmount2_2: toFixNumber(hgBet2_2 * hgOdds2_2, 3),
    JCgoalLine1: jcGoalLine1,
    JCgoalLine2: jcGoalLine2,
    HGgoalLine1_1: hgGoalLine1_1,
    HGgoalLine1_2: hgGoalLine1_2,
    HGgoalLine2_1: hgGoalLine2_1,
    HGgoalLine2_2: hgGoalLine2_2,
    JCTzOdd1: jcOdds1,
    JCTzOdd2: jcOdds2,
    HGTzOdd1_1: hgOdds1_1,
    HGTzOdd1_2: hgOdds1_2,
    HGTzOdd2_1: hgOdds2_1,
    HGTzOdd2_2: hgOdds2_2,
    yield: 'Sin',
    planId: `${info1.matchId}_${info1.data.jcOdds1}_${info2.matchId}_${info2.data.jcOdds1}`,
    JCTouz1: jcResult1,
    JCTouz2: jcResult2,
    HGTouz1_1: hgResult1_1,
    HGTouz1_2: hgResult1_2,
    HGTouz2_1: hgResult2_1,
    HGTouz2_2: hgResult2_2,
  } as ChuanInfo;
};