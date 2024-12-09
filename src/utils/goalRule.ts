import { existsSync, readFileSync, writeFileSync } from 'fs';
import { PointOptions, GoalInfo, GoalRule, JCInfo, HGInfo } from '../type/index.ts';
import { uniqBy, toNumber, getGaussElimination, getGoalLineNumberList, getBettingResultByBettingList } from './index.ts';
import path from 'path';
import { GoalLine } from '../type/index.ts';
import { TotalResult } from '../type/index.ts';
import { BETTING_RESULT } from '../type/index.ts';

let GlobalGoalRuleList: GoalRule[] = [];
const FILE_PATH = path.resolve(import.meta.dirname || './', '../../rule/goalRule.csv');
const CSV_HEAD = [
  'jcTotal0',
  'jcTotal1',
  'jcTotal2',
  'jcTotal3',
  'jcTotal4',
  'jcTotal5',
  'jcTotal6',
  'jcTotal7',
  'hgGoalLine1',
  'hgResult1',
  'hgGoalLine2',
  'hgResult2',
] as const;

export const updateGoalRuleList = (sinDataList: GoalInfo[]) => {
  const allGoalLine = sinDataList.map((item) => {
    return {
      jcTotal0: !!toNumber(item.data.JCTzOdds0),
      jcTotal1: !!toNumber(item.data.JCTzOdds1),
      jcTotal2: !!toNumber(item.data.JCTzOdds2),
      jcTotal3: !!toNumber(item.data.JCTzOdds3),
      jcTotal4: !!toNumber(item.data.JCTzOdds4),
      jcTotal5: !!toNumber(item.data.JCTzOdds5),
      jcTotal6: !!toNumber(item.data.JCTzOdds6),
      jcTotal7: !!toNumber(item.data.JCTzOdds7),
      hgGoalLine1: item.data.HGgoalLine1,
      hgResult1: item.data.HGTouz1,
      hgGoalLine2: toNumber(item.data.HGTzOdds2) === 0 ? '-' : item.data.HGgoalLine2,
      hgResult2: toNumber(item.data.HGTzOdds2) === 0 ? '-' : item.data.HGTouz2,
    };
  });
  const oldGoalLineRuleList = getGoalRuleList();

  const itemList = [...allGoalLine, ...oldGoalLineRuleList];
  const uniqItemList = uniqBy(itemList, (item) => CSV_HEAD.map((key) => item[key]).join(',')).sort((v1, v2) => {
    const aIndex =
      toNumber(v1.jcTotal0) * 10000000 +
      toNumber(v1.jcTotal1) * 1000000 +
      toNumber(v1.jcTotal2) * 100000 +
      toNumber(v1.jcTotal3) * 10000 +
      toNumber(v1.jcTotal4) * 1000 +
      toNumber(v1.jcTotal5) * 100 +
      toNumber(v1.jcTotal6) * 10 +
      toNumber(v1.jcTotal7) * 1;
    const bIndex =
      toNumber(v2.jcTotal0) * 10000000 +
      toNumber(v2.jcTotal1) * 1000000 +
      toNumber(v2.jcTotal2) * 100000 +
      toNumber(v2.jcTotal3) * 10000 +
      toNumber(v2.jcTotal4) * 1000 +
      toNumber(v2.jcTotal5) * 100 +
      toNumber(v2.jcTotal6) * 10 +
      toNumber(v2.jcTotal7) * 1;
    return aIndex - bIndex;
  });

  writeFileSync(
    FILE_PATH,
    CSV_HEAD.map((key) => {
      if (key === 'jcTotal0') return '竞彩0球';
      if (key === 'jcTotal1') return '竞彩1球';
      if (key === 'jcTotal2') return '竞彩2球';
      if (key === 'jcTotal3') return '竞彩3球';
      if (key === 'jcTotal4') return '竞彩4球';
      if (key === 'jcTotal5') return '竞彩5球';
      if (key === 'jcTotal6') return '竞彩6球';
      if (key === 'jcTotal7') return '竞彩7球';
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

export const getGoalRuleList = () => {
  if (GlobalGoalRuleList?.length) return GlobalGoalRuleList;
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
      }, {} as GoalRule);
    });
  GlobalGoalRuleList = ruleList;
  return GlobalGoalRuleList;
};

function getBettingResult(
  item1: { totalCount: number; isJc: true } | { goalLine: GoalLine; isJc: false; result: TotalResult },
  item2: { totalCount: number; isJc: true } | { goalLine: GoalLine; isJc: false; result: TotalResult }
) {
  if (item1.isJc && item2.isJc && item1.totalCount === item2.totalCount) return BETTING_RESULT.win;
  if (item1.isJc && item2.isJc && item1.totalCount !== item2.totalCount) return BETTING_RESULT.lose;
  if (item1.isJc && !item2.isJc) {
    const resultList = getGoalLineNumberList(item2.goalLine).map((num) => {
      if (num === item1.totalCount) return BETTING_RESULT.refund;
      if (num < item1.totalCount && item2.result === 'D') return BETTING_RESULT.win;
      if (num > item1.totalCount && item2.result === 'X') return BETTING_RESULT.win;
      if (num > item1.totalCount && item2.result === 'D') return BETTING_RESULT.lose;
      if (num < item1.totalCount && item2.result === 'X') return BETTING_RESULT.lose;
      return BETTING_RESULT.unableDetermine;
    }) as [BETTING_RESULT, BETTING_RESULT];
    return getBettingResultByBettingList(resultList);
  }
  if (!item1.isJc && item2.isJc) {
    const resultList = getGoalLineNumberList(item1.goalLine).map((num) => {
      if (num === item2.totalCount) return BETTING_RESULT.refund;
      if (num < item2.totalCount && item1.result === 'D') return BETTING_RESULT.win;
      if (num > item2.totalCount && item1.result === 'X') return BETTING_RESULT.win;
      if (num > item2.totalCount && item1.result === 'D') return BETTING_RESULT.lose;
      if (num < item2.totalCount && item1.result === 'X') return BETTING_RESULT.lose;
      return BETTING_RESULT.unableDetermine;
    }) as [BETTING_RESULT, BETTING_RESULT];
    return getBettingResultByBettingList(resultList);
  }
  if (!item1.isJc && !item2.isJc) {
    return BETTING_RESULT.refund;
  }
  return BETTING_RESULT.unableDetermine;
}

function getCoefficient(
  item1: { totalCount: number; isJc: true } | { goalLine: GoalLine; isJc: false; result: TotalResult },
  item2: { totalCount: number; isJc: true; odds: number } | { goalLine: GoalLine; isJc: false; result: TotalResult; odds: number },
  op: Omit<PointOptions, 'JCPointChuan'>
) {
  if (item2.odds === 0) {
    return 0;
  }
  const bettingResult = getBettingResult(item1, item2);
  if (item2.isJc) {
    if (bettingResult === BETTING_RESULT.win) return item2.odds - 1 + op.JCPointSin;
    if (bettingResult === BETTING_RESULT.lose) return -1 + op.JCPointSin;
    return 0;
  }
  if (!item2.isJc) {
    if (bettingResult === BETTING_RESULT.win) return item2.odds - 1 + (item2.odds - 1) * op.HGPoint;
    if (bettingResult === BETTING_RESULT.lose) return -1 + op.HGPoint;
    return 0;
  }
  return 0;
}

export function getGoalInfoData(
  item: {
    jcOdd0: number;
    jcOdd1: number;
    jcOdd2: number;
    jcOdd3: number;
    jcOdd4: number;
    jcOdd5: number;
    jcOdd6: number;
    jcOdd7: number;
    hgOdd1: number;
    hgGoalLine1: GoalLine;
    hgResult1: TotalResult;
    hgOdd2: number;
    hgGoalLine2: GoalLine;
    hgResult2: TotalResult;
  },
  op: Omit<PointOptions, 'JCPointChuan'>
) {
  const { jcOdd0, jcOdd1, jcOdd2, jcOdd3, jcOdd4, jcOdd5, jcOdd6, jcOdd7, hgOdd1, hgGoalLine1, hgResult1, hgOdd2, hgGoalLine2, hgResult2 } =
    item;

  const a1 = getCoefficient({ totalCount: 0, isJc: true }, { totalCount: 0, isJc: true, odds: jcOdd0 }, op);
  const b1 = getCoefficient({ totalCount: 0, isJc: true }, { totalCount: 1, isJc: true, odds: jcOdd1 }, op);
  const c1 = getCoefficient({ totalCount: 0, isJc: true }, { totalCount: 2, isJc: true, odds: jcOdd2 }, op);
  const d1 = getCoefficient({ totalCount: 0, isJc: true }, { totalCount: 3, isJc: true, odds: jcOdd3 }, op);
  const e1 = getCoefficient({ totalCount: 0, isJc: true }, { totalCount: 4, isJc: true, odds: jcOdd4 }, op);
  const f1 = getCoefficient({ totalCount: 0, isJc: true }, { totalCount: 5, isJc: true, odds: jcOdd5 }, op);
  const g1 = getCoefficient({ totalCount: 0, isJc: true }, { totalCount: 6, isJc: true, odds: jcOdd6 }, op);
  const h1 = getCoefficient({ totalCount: 0, isJc: true }, { totalCount: 7, isJc: true, odds: jcOdd7 }, op);
  const i1 = getCoefficient({ totalCount: 0, isJc: true }, { goalLine: hgGoalLine1, isJc: false, odds: hgOdd1, result: hgResult1 }, op);
  const j1 = getCoefficient({ totalCount: 0, isJc: true }, { goalLine: hgGoalLine2, isJc: false, odds: hgOdd2, result: hgResult2 }, op);
  const k1 = jcOdd0 ? 0 : -1;
  const m1 = 0;

  const a2 = getCoefficient({ totalCount: 1, isJc: true }, { totalCount: 0, isJc: true, odds: jcOdd0 }, op);
  const b2 = getCoefficient({ totalCount: 1, isJc: true }, { totalCount: 1, isJc: true, odds: jcOdd1 }, op);
  const c2 = getCoefficient({ totalCount: 1, isJc: true }, { totalCount: 2, isJc: true, odds: jcOdd2 }, op);
  const d2 = getCoefficient({ totalCount: 1, isJc: true }, { totalCount: 3, isJc: true, odds: jcOdd3 }, op);
  const e2 = getCoefficient({ totalCount: 1, isJc: true }, { totalCount: 4, isJc: true, odds: jcOdd4 }, op);
  const f2 = getCoefficient({ totalCount: 1, isJc: true }, { totalCount: 5, isJc: true, odds: jcOdd5 }, op);
  const g2 = getCoefficient({ totalCount: 1, isJc: true }, { totalCount: 6, isJc: true, odds: jcOdd6 }, op);
  const h2 = getCoefficient({ totalCount: 1, isJc: true }, { totalCount: 7, isJc: true, odds: jcOdd7 }, op);
  const i2 = getCoefficient({ totalCount: 1, isJc: true }, { goalLine: hgGoalLine1, isJc: false, odds: hgOdd1, result: hgResult1 }, op);
  const j2 = getCoefficient({ totalCount: 1, isJc: true }, { goalLine: hgGoalLine2, isJc: false, odds: hgOdd2, result: hgResult2 }, op);
  const k2 = jcOdd1 ? 0 : -1;
  const m2 = 0;

  const a3 = getCoefficient({ totalCount: 2, isJc: true }, { totalCount: 0, isJc: true, odds: jcOdd0 }, op);
  const b3 = getCoefficient({ totalCount: 2, isJc: true }, { totalCount: 1, isJc: true, odds: jcOdd1 }, op);
  const c3 = getCoefficient({ totalCount: 2, isJc: true }, { totalCount: 2, isJc: true, odds: jcOdd2 }, op);
  const d3 = getCoefficient({ totalCount: 2, isJc: true }, { totalCount: 3, isJc: true, odds: jcOdd3 }, op);
  const e3 = getCoefficient({ totalCount: 2, isJc: true }, { totalCount: 4, isJc: true, odds: jcOdd4 }, op);
  const f3 = getCoefficient({ totalCount: 2, isJc: true }, { totalCount: 5, isJc: true, odds: jcOdd5 }, op);
  const g3 = getCoefficient({ totalCount: 2, isJc: true }, { totalCount: 6, isJc: true, odds: jcOdd6 }, op);
  const h3 = getCoefficient({ totalCount: 2, isJc: true }, { totalCount: 7, isJc: true, odds: jcOdd7 }, op);
  const i3 = getCoefficient({ totalCount: 2, isJc: true }, { goalLine: hgGoalLine1, isJc: false, odds: hgOdd1, result: hgResult1 }, op);
  const j3 = getCoefficient({ totalCount: 2, isJc: true }, { goalLine: hgGoalLine2, isJc: false, odds: hgOdd2, result: hgResult2 }, op);
  const k3 = jcOdd2 ? 0 : -1;
  const m3 = 0;

  const a4 = getCoefficient({ totalCount: 3, isJc: true }, { totalCount: 0, isJc: true, odds: jcOdd0 }, op);
  const b4 = getCoefficient({ totalCount: 3, isJc: true }, { totalCount: 1, isJc: true, odds: jcOdd1 }, op);
  const c4 = getCoefficient({ totalCount: 3, isJc: true }, { totalCount: 2, isJc: true, odds: jcOdd2 }, op);
  const d4 = getCoefficient({ totalCount: 3, isJc: true }, { totalCount: 3, isJc: true, odds: jcOdd3 }, op);
  const e4 = getCoefficient({ totalCount: 3, isJc: true }, { totalCount: 4, isJc: true, odds: jcOdd4 }, op);
  const f4 = getCoefficient({ totalCount: 3, isJc: true }, { totalCount: 5, isJc: true, odds: jcOdd5 }, op);
  const g4 = getCoefficient({ totalCount: 3, isJc: true }, { totalCount: 6, isJc: true, odds: jcOdd6 }, op);
  const h4 = getCoefficient({ totalCount: 3, isJc: true }, { totalCount: 7, isJc: true, odds: jcOdd7 }, op);
  const i4 = getCoefficient({ totalCount: 3, isJc: true }, { goalLine: hgGoalLine1, isJc: false, odds: hgOdd1, result: hgResult1 }, op);
  const j4 = getCoefficient({ totalCount: 3, isJc: true }, { goalLine: hgGoalLine2, isJc: false, odds: hgOdd2, result: hgResult2 }, op);
  const k4 = jcOdd3 ? 0 : -1;
  const m4 = 0;

  const a5 = getCoefficient({ totalCount: 4, isJc: true }, { totalCount: 0, isJc: true, odds: jcOdd0 }, op);
  const b5 = getCoefficient({ totalCount: 4, isJc: true }, { totalCount: 1, isJc: true, odds: jcOdd1 }, op);
  const c5 = getCoefficient({ totalCount: 4, isJc: true }, { totalCount: 2, isJc: true, odds: jcOdd2 }, op);
  const d5 = getCoefficient({ totalCount: 4, isJc: true }, { totalCount: 3, isJc: true, odds: jcOdd3 }, op);
  const e5 = getCoefficient({ totalCount: 4, isJc: true }, { totalCount: 4, isJc: true, odds: jcOdd4 }, op);
  const f5 = getCoefficient({ totalCount: 4, isJc: true }, { totalCount: 5, isJc: true, odds: jcOdd5 }, op);
  const g5 = getCoefficient({ totalCount: 4, isJc: true }, { totalCount: 6, isJc: true, odds: jcOdd6 }, op);
  const h5 = getCoefficient({ totalCount: 4, isJc: true }, { totalCount: 7, isJc: true, odds: jcOdd7 }, op);
  const i5 = getCoefficient({ totalCount: 4, isJc: true }, { goalLine: hgGoalLine1, isJc: false, odds: hgOdd1, result: hgResult1 }, op);
  const j5 = getCoefficient({ totalCount: 4, isJc: true }, { goalLine: hgGoalLine2, isJc: false, odds: hgOdd2, result: hgResult2 }, op);
  const k5 = jcOdd4 ? 0 : -1;
  const m5 = 0;

  const a6 = getCoefficient({ totalCount: 5, isJc: true }, { totalCount: 0, isJc: true, odds: jcOdd0 }, op);
  const b6 = getCoefficient({ totalCount: 5, isJc: true }, { totalCount: 1, isJc: true, odds: jcOdd1 }, op);
  const c6 = getCoefficient({ totalCount: 5, isJc: true }, { totalCount: 2, isJc: true, odds: jcOdd2 }, op);
  const d6 = getCoefficient({ totalCount: 5, isJc: true }, { totalCount: 3, isJc: true, odds: jcOdd3 }, op);
  const e6 = getCoefficient({ totalCount: 5, isJc: true }, { totalCount: 4, isJc: true, odds: jcOdd4 }, op);
  const f6 = getCoefficient({ totalCount: 5, isJc: true }, { totalCount: 5, isJc: true, odds: jcOdd5 }, op);
  const g6 = getCoefficient({ totalCount: 5, isJc: true }, { totalCount: 6, isJc: true, odds: jcOdd6 }, op);
  const h6 = getCoefficient({ totalCount: 5, isJc: true }, { totalCount: 7, isJc: true, odds: jcOdd7 }, op);
  const i6 = getCoefficient({ totalCount: 5, isJc: true }, { goalLine: hgGoalLine1, isJc: false, odds: hgOdd1, result: hgResult1 }, op);
  const j6 = getCoefficient({ totalCount: 5, isJc: true }, { goalLine: hgGoalLine2, isJc: false, odds: hgOdd2, result: hgResult2 }, op);
  const k6 = jcOdd5 ? 0 : -1;
  const m6 = 0;

  const a7 = getCoefficient({ totalCount: 6, isJc: true }, { totalCount: 0, isJc: true, odds: jcOdd0 }, op);
  const b7 = getCoefficient({ totalCount: 6, isJc: true }, { totalCount: 1, isJc: true, odds: jcOdd1 }, op);
  const c7 = getCoefficient({ totalCount: 6, isJc: true }, { totalCount: 2, isJc: true, odds: jcOdd2 }, op);
  const d7 = getCoefficient({ totalCount: 6, isJc: true }, { totalCount: 3, isJc: true, odds: jcOdd3 }, op);
  const e7 = getCoefficient({ totalCount: 6, isJc: true }, { totalCount: 4, isJc: true, odds: jcOdd4 }, op);
  const f7 = getCoefficient({ totalCount: 6, isJc: true }, { totalCount: 5, isJc: true, odds: jcOdd5 }, op);
  const g7 = getCoefficient({ totalCount: 6, isJc: true }, { totalCount: 6, isJc: true, odds: jcOdd6 }, op);
  const h7 = getCoefficient({ totalCount: 6, isJc: true }, { totalCount: 7, isJc: true, odds: jcOdd7 }, op);
  const i7 = getCoefficient({ totalCount: 6, isJc: true }, { goalLine: hgGoalLine1, isJc: false, odds: hgOdd1, result: hgResult1 }, op);
  const j7 = getCoefficient({ totalCount: 6, isJc: true }, { goalLine: hgGoalLine2, isJc: false, odds: hgOdd2, result: hgResult2 }, op);
  const k7 = jcOdd6 ? 0 : -1;
  const m7 = 0;

  const a8 = getCoefficient({ totalCount: 7, isJc: true }, { totalCount: 0, isJc: true, odds: jcOdd0 }, op);
  const b8 = getCoefficient({ totalCount: 7, isJc: true }, { totalCount: 1, isJc: true, odds: jcOdd1 }, op);
  const c8 = getCoefficient({ totalCount: 7, isJc: true }, { totalCount: 2, isJc: true, odds: jcOdd2 }, op);
  const d8 = getCoefficient({ totalCount: 7, isJc: true }, { totalCount: 3, isJc: true, odds: jcOdd3 }, op);
  const e8 = getCoefficient({ totalCount: 7, isJc: true }, { totalCount: 4, isJc: true, odds: jcOdd4 }, op);
  const f8 = getCoefficient({ totalCount: 7, isJc: true }, { totalCount: 5, isJc: true, odds: jcOdd5 }, op);
  const g8 = getCoefficient({ totalCount: 7, isJc: true }, { totalCount: 6, isJc: true, odds: jcOdd6 }, op);
  const h8 = getCoefficient({ totalCount: 7, isJc: true }, { totalCount: 7, isJc: true, odds: jcOdd7 }, op);
  const i8 = getCoefficient({ totalCount: 7, isJc: true }, { goalLine: hgGoalLine1, isJc: false, odds: hgOdd1, result: hgResult1 }, op);
  const j8 = getCoefficient({ totalCount: 7, isJc: true }, { goalLine: hgGoalLine2, isJc: false, odds: hgOdd2, result: hgResult2 }, op);
  const k8 = jcOdd7 ? 0 : -1;
  const m8 = 0;

  const a9 = getCoefficient({ goalLine: hgGoalLine1, isJc: false, result: hgResult1 }, { totalCount: 0, isJc: true, odds: jcOdd0 }, op);
  const b9 = getCoefficient({ goalLine: hgGoalLine1, isJc: false, result: hgResult1 }, { totalCount: 1, isJc: true, odds: jcOdd1 }, op);
  const c9 = getCoefficient({ goalLine: hgGoalLine1, isJc: false, result: hgResult1 }, { totalCount: 2, isJc: true, odds: jcOdd2 }, op);
  const d9 = getCoefficient({ goalLine: hgGoalLine1, isJc: false, result: hgResult1 }, { totalCount: 3, isJc: true, odds: jcOdd3 }, op);
  const e9 = getCoefficient({ goalLine: hgGoalLine1, isJc: false, result: hgResult1 }, { totalCount: 4, isJc: true, odds: jcOdd4 }, op);
  const f9 = getCoefficient({ goalLine: hgGoalLine1, isJc: false, result: hgResult1 }, { totalCount: 5, isJc: true, odds: jcOdd5 }, op);
  const g9 = getCoefficient({ goalLine: hgGoalLine1, isJc: false, result: hgResult1 }, { totalCount: 6, isJc: true, odds: jcOdd6 }, op);
  const h9 = getCoefficient({ goalLine: hgGoalLine1, isJc: false, result: hgResult1 }, { totalCount: 7, isJc: true, odds: jcOdd7 }, op);
  const i9 = getCoefficient(
    { goalLine: hgGoalLine1, isJc: false, result: hgResult1 },
    { goalLine: hgGoalLine1, isJc: false, odds: hgOdd1, result: hgResult1 },
    op
  );
  const j9 = getCoefficient(
    { goalLine: hgGoalLine1, isJc: false, result: hgResult1 },
    { goalLine: hgGoalLine2, isJc: false, odds: hgOdd2, result: hgResult2 },
    op
  );
  const k9 = hgOdd1 ? 0 : -1;
  const m9 = 0;

  const a10 = getCoefficient({ goalLine: hgGoalLine2, isJc: false, result: hgResult2 }, { totalCount: 0, isJc: true, odds: jcOdd0 }, op);
  const b10 = getCoefficient({ goalLine: hgGoalLine2, isJc: false, result: hgResult2 }, { totalCount: 1, isJc: true, odds: jcOdd1 }, op);
  const c10 = getCoefficient({ goalLine: hgGoalLine2, isJc: false, result: hgResult2 }, { totalCount: 2, isJc: true, odds: jcOdd2 }, op);
  const d10 = getCoefficient({ goalLine: hgGoalLine2, isJc: false, result: hgResult2 }, { totalCount: 3, isJc: true, odds: jcOdd3 }, op);
  const e10 = getCoefficient({ goalLine: hgGoalLine2, isJc: false, result: hgResult2 }, { totalCount: 4, isJc: true, odds: jcOdd4 }, op);
  const f10 = getCoefficient({ goalLine: hgGoalLine2, isJc: false, result: hgResult2 }, { totalCount: 5, isJc: true, odds: jcOdd5 }, op);
  const g10 = getCoefficient({ goalLine: hgGoalLine2, isJc: false, result: hgResult2 }, { totalCount: 6, isJc: true, odds: jcOdd6 }, op);
  const h10 = getCoefficient({ goalLine: hgGoalLine2, isJc: false, result: hgResult2 }, { totalCount: 7, isJc: true, odds: jcOdd7 }, op);
  const i10 = getCoefficient(
    { goalLine: hgGoalLine2, isJc: false, result: hgResult2 },
    { goalLine: hgGoalLine1, isJc: false, odds: hgOdd1, result: hgResult1 },
    op
  );
  const j10 = getCoefficient(
    { goalLine: hgGoalLine2, isJc: false, result: hgResult2 },
    { goalLine: hgGoalLine2, isJc: false, odds: hgOdd2, result: hgResult2 },
    op
  );
  const k10 = hgOdd2 ? 0 : -1;
  const m10 = 0;

  // jc 所有投注相加等于 jcBet
  const a11 = 1;
  const b11 = 1;
  const c11 = 1;
  const d11 = 1;
  const e11 = 1;
  const f11 = 1;
  const g11 = 1;
  const h11 = 1;
  const i11 = 0;
  const j11 = 0;
  const k11 = 0;
  const m11 = op.JCBet;

  const [jcBet0, jcBet1, jcBet2, jcBet3, jcBet4, jcBet5, jcBet6, jcBet7, hgBet1, hgBet2, profit] = getGaussElimination(
    [
      [a1, b1, c1, d1, e1, f1, g1, h1, i1, j1, k1],
      [a2, b2, c2, d2, e2, f2, g2, h2, i2, j2, k2],
      [a3, b3, c3, d3, e3, f3, g3, h3, i3, j3, k3],
      [a4, b4, c4, d4, e4, f4, g4, h4, i4, j4, k4],
      [a5, b5, c5, d5, e5, f5, g5, h5, i5, j5, k5],
      [a6, b6, c6, d6, e6, f6, g6, h6, i6, j6, k6],
      [a7, b7, c7, d7, e7, f7, g7, h7, i7, j7, k7],
      [a8, b8, c8, d8, e8, f8, g8, h8, i8, j8, k8],
      [a9, b9, c9, d9, e9, f9, g9, h9, i9, j9, k9],
      [a10, b10, c10, d10, e10, f10, g10, h10, i10, j10, k10],
      [a11, b11, c11, d11, e11, f11, g11, h11, i11, j11, k11],
    ],
    [m1, m2, m3, m4, m5, m6, m7, m8, m9, m10, m11]
  );
  return {
    JCTzAmt0: jcBet0,
    JCTzOdds0: jcOdd0,
    JCTzAmt1: jcBet1,
    JCTzOdds1: jcOdd1,
    JCTzAmt2: jcBet2,
    JCTzOdds2: jcOdd2,
    JCTzAmt3: jcBet3,
    JCTzOdds3: jcOdd3,
    JCTzAmt4: jcBet4,
    JCTzOdds4: jcOdd4,
    JCTzAmt5: jcBet5,
    JCTzOdds5: jcOdd5,
    JCTzAmt6: jcBet6,
    JCTzOdds6: jcOdd6,
    JCTzAmt7: jcBet7,
    JCTzOdds7: jcOdd7,
    HGTouz1: hgResult1,
    HGTouz2: hgResult2,
    HGgoalLine1: hgGoalLine1,
    HGgoalLine2: hgGoalLine2,
    HGTzAmt1: hgBet1,
    HGTzAmt2: hgBet2,
    HGTzOdds1: hgOdd1,
    HGTzOdds2: hgOdd2,
    consult: 'HG',
    profit: profit,
    profitRate: `${(profit / op.JCBet) * 100}%`,
    ttgTzAmt: op.JCBet,
    JCTotalAmt: 0,
  };
}

export function getMatchGoalInfo(jcInfo: JCInfo, hgInfo: HGInfo, op: Omit<PointOptions, 'JCPointChuan'>) {
  const ruleList = getGoalRuleList().filter((rule) => {
    const goalLineList = [
      hgInfo.hilo_goalLine1,
      hgInfo.hilo_goalLine2,
      hgInfo.hilo_goalLine3,
      hgInfo.hilo_goalLine4,
      hgInfo.hilo_goalLine5,
    ];
    if (!goalLineList.includes(rule.hgGoalLine1)) return false;
    if (rule.hgGoalLine2 === '-') return true;
    return goalLineList.includes(rule.hgGoalLine2);
  });
  if (!ruleList?.length) return void 0;
  const hgList = [
    { goalLine: hgInfo.hilo_goalLine1, dOdds: toNumber(hgInfo.hilo_a1), xOdds: toNumber(hgInfo.hilo_h1) },
    { goalLine: hgInfo.hilo_goalLine2, dOdds: toNumber(hgInfo.hilo_a2), xOdds: toNumber(hgInfo.hilo_h2) },
    { goalLine: hgInfo.hilo_goalLine3, dOdds: toNumber(hgInfo.hilo_a3), xOdds: toNumber(hgInfo.hilo_h3) },
    { goalLine: hgInfo.hilo_goalLine4, dOdds: toNumber(hgInfo.hilo_a4), xOdds: toNumber(hgInfo.hilo_h4) },
    { goalLine: hgInfo.hilo_goalLine5, dOdds: toNumber(hgInfo.hilo_a5), xOdds: toNumber(hgInfo.hilo_h5) },
  ];
  return ruleList.map((rule) => {
    const jcOdd0 = toNumber(rule.jcTotal0 ? jcInfo.ttg_s0 : 0);
    const jcOdd1 = toNumber(rule.jcTotal1 ? jcInfo.ttg_s1 : 0);
    const jcOdd2 = toNumber(rule.jcTotal2 ? jcInfo.ttg_s2 : 0);
    const jcOdd3 = toNumber(rule.jcTotal3 ? jcInfo.ttg_s3 : 0);
    const jcOdd4 = toNumber(rule.jcTotal4 ? jcInfo.ttg_s4 : 0);
    const jcOdd5 = toNumber(rule.jcTotal5 ? jcInfo.ttg_s5 : 0);
    const jcOdd6 = toNumber(rule.jcTotal6 ? jcInfo.ttg_s6 : 0);
    const jcOdd7 = toNumber(rule.jcTotal7 ? jcInfo.ttg_s7 : 0);
    const matchedHg1 = hgList.find((item) => item.goalLine === rule.hgGoalLine1);
    const matchedHg2 = hgList.find((item) => item.goalLine === rule.hgGoalLine2);
    const hgOdd1 = !matchedHg1 ? 0 : rule.hgResult1 === 'D' ? matchedHg1?.dOdds : matchedHg1?.xOdds;
    const hgGoalLine1 = !matchedHg1 ? '-' : matchedHg1.goalLine;
    const hgResult1 = !matchedHg1 ? '-' : rule.hgResult1;
    const hgOdd2 = !matchedHg2 ? 0 : rule.hgResult2 === 'D' ? matchedHg2?.dOdds : matchedHg2?.xOdds;
    const hgGoalLine2 = !matchedHg2 ? '-' : matchedHg2.goalLine;
    const hgResult2 = !matchedHg2 ? '-' : rule.hgResult2;
    const data = getGoalInfoData(
      {
        jcOdd0,
        jcOdd1,
        jcOdd2,
        jcOdd3,
        jcOdd4,
        jcOdd5,
        jcOdd6,
        jcOdd7,
        hgOdd1,
        hgGoalLine1,
        hgResult1,
        hgOdd2,
        hgGoalLine2,
        hgResult2,
      },
      op
    );
    return {
      matchId: jcInfo.matchId,
      data,
    };
  });
}
