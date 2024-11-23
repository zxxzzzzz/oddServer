import { readFileSync, writeFileSync } from 'fs';
import { BETTING_RESULT, GlobalOptions, GoalLine, SinRule, Result, SinInfo, DataOfSinInfo, HGInfo, JCInfo, } from '../type/index';
import { everyWithTolerance, range, uniqBy } from './index';
import path from 'path';
import { getGaussElimination, toFixNumber, toNumber } from './lodash';
import { getMethod } from './methodRule';

let GlobalGoalLineRuleList: SinRule[] = [];
const FILE_PATH = path.resolve(__dirname, '../../cache/sinRule.csv');
const CSV_HEAD = ['jcGoalLine1', 'jcResult1', 'jcGoalLine2', 'jcResult2', 'hgGoalLine1', 'hgResult1', 'hgGoalLine2', 'hgResult2'] as const;

export const updateSinRuleList = (sinDataList: SinInfo[]) => {
  const allGoalLine = sinDataList.map((item) => {
    return {
      jcGoalLine1: item.data.JCgoalLine1,
      jcResult1: item.data.JCTouz1,
      jcGoalLine2: item.data.JCgoalLine2,
      jcResult2: item.data.JCTouz2,
      hgGoalLine1: item.data.HGgoalLine1,
      hgResult1: item.data.HGTouz1,
      hgGoalLine2: item.data.HGgoalLine2,
      hgResult2: item.data.HGTouz2,
    };
  });
  const oldGoalLineRuleList = getSinRuleList();

  const itemList = [...allGoalLine, ...oldGoalLineRuleList];
  const uniqItemList = uniqBy(itemList, (item) => CSV_HEAD.map((key) => item[key]).join(',')).sort((v1, v2) => {
    const aIndex =
      toNumber(v1.jcGoalLine1) * 1000 +
      toNumber(v1.jcGoalLine2)  * 100 +
      toNumber(v1.hgGoalLine1) * 10 +
      toNumber(v1.hgGoalLine2) * 1;
    const bIndex =
      toNumber(v2.jcGoalLine1) * 1000 +
      toNumber(v2.jcGoalLine2)  * 100 +
      toNumber(v2.hgGoalLine1) * 10 +
      toNumber(v2.hgGoalLine2) * 1;
    return aIndex - bIndex;
  });

  writeFileSync(
    FILE_PATH,
    CSV_HEAD
      .map((key) => {
        if (key === 'jcGoalLine1') return '竞彩让球线1';
        if (key === 'jcGoalLine2') return '竞彩让球线2';
        if (key === 'jcResult1') return '竞彩比赛结果1';
        if (key === 'jcResult2') return '竞彩比赛结果2';
        if (key === 'hgGoalLine1') return '皇冠让球线1';
        if (key === 'hgGoalLine2') return '皇冠让球线2';
        if (key === 'hgResult1') return '皇冠比赛结果1';
        if (key === 'hgResult2') return '皇冠比赛结果2';
        return key;
      })
      .join(',') + '\n',
    { encoding: 'utf-8' }
  );
  writeFileSync(
    FILE_PATH,
    uniqItemList
      .map((item) =>
        CSV_HEAD
          .map((key) => {
            const v = item[key];
            return v;
          })
          .join(',')
      )
      .join('\n'),
    { flag: 'a', encoding: 'utf-8' }
  );
};

export const getSinRuleList = () => {
  if (GlobalGoalLineRuleList?.length) return GlobalGoalLineRuleList;
  const ruleList = readFileSync(FILE_PATH, { encoding: 'utf-8' })
    .replace(/\r\n/g, '\n')
    .split('\n')
    .slice(1)
    .map((line: string) => {
      const vList = line.split(',').map((v) => {
        return v;
      });
      return CSV_HEAD.reduce((re, key, index)=>{
        const v = vList[index]
        return {...re, [key]:v}
      }, {} as SinRule)
    });
  GlobalGoalLineRuleList = ruleList;
  return GlobalGoalLineRuleList;
};

/**把goal分割成一个二维数组，可以用来方便处理 x.25 x.75的情况 */
function getGoalLineNumberList(goalLine: GoalLine) {
  let goalLineList = [0, 0];
  if (goalLine === '-') goalLineList = [0, 0];
  if (['0', '1', '2', '3', '4', '5', '+0', '+1', '+2', '+3', '+4', '+5', '-1', '-2', '-3', '-4', '-5'].includes(goalLine)) {
    goalLineList = [parseFloat(goalLine), parseFloat(goalLine)];
  }
  if (
    [
      '0.25',
      '1.25',
      '2.25',
      '3.25',
      '4.25',
      '5.25',
      '+0.25',
      '+1.25',
      '+2.25',
      '+3.25',
      '+4.25',
      '+5.25',
      '-0.25',
      '-1.25',
      '-2.25',
      '-3.25',
      '-4.25',
      '-5.25',
    ].includes(goalLine)
  ) {
    goalLineList = [parseFloat(goalLine) - 0.25, parseFloat(goalLine) + 0.25];
  }
  if (
    [
      '0.5',
      '1.5',
      '2.5',
      '3.5',
      '4.5',
      '5.5',
      '+0.5',
      '+1.5',
      '+2.5',
      '+3.5',
      '+4.5',
      '+5.5',
      '-0.5',
      '-1.5',
      '-2.5',
      '-3.5',
      '-4.5',
      '-5.5',
    ].includes(goalLine)
  ) {
    goalLineList = [parseFloat(goalLine), parseFloat(goalLine)];
  }
  if (
    [
      '0.75',
      '1.75',
      '2.75',
      '3.75',
      '4.75',
      '5.75',
      '+0.75',
      '+1.75',
      '+2.75',
      '+3.75',
      '+4.75',
      '+5.75',
      '-0.75',
      '-1.75',
      '-2.75',
      '-3.75',
      '-4.75',
      '-5.75',
    ].includes(goalLine)
  ) {
    goalLineList = [parseFloat(goalLine) - 0.25, parseFloat(goalLine) + 0.25];
  }
  return goalLineList as [number, number];
}

function getBettingResultByBettingList(betList: [BETTING_RESULT, BETTING_RESULT]) {
  const winCount = betList.reduce((re, cur) => {
    return re + (cur === BETTING_RESULT.win ? 1 : 0);
  }, 0);
  const loseCount = betList.reduce((re, cur) => {
    return re + (cur === BETTING_RESULT.lose ? 1 : 0);
  }, 0);
  const refundCount = betList.reduce((re, cur) => {
    return re + (cur === BETTING_RESULT.refund ? 1 : 0);
  }, 0);
  const unableDetermineCount = betList.reduce((re, cur) => {
    return re + (cur === BETTING_RESULT.unableDetermine ? 1 : 0);
  }, 0);
  if (winCount === 2) return BETTING_RESULT.win;
  if (winCount === 1 && unableDetermineCount === 1) return BETTING_RESULT.win;
  if (winCount === 1 && loseCount === 1) return BETTING_RESULT.halfWinLose;
  if (winCount === 1 && refundCount === 1) return BETTING_RESULT.halfWin;
  if (loseCount === 2) return BETTING_RESULT.lose;
  if (loseCount === 1 && refundCount === 1) return BETTING_RESULT.halfLose;
  if (loseCount === 1 && unableDetermineCount === 1) return BETTING_RESULT.lose;
  if (refundCount === 2) return BETTING_RESULT.refund;
  return BETTING_RESULT.unableDetermine;
}

/**获取获胜的 主-客 的分差 */
function getWinGoalList(item: { goalLine: GoalLine; result: 'h' | 'd' | 'a' | '-'; isJC: boolean }) {
  if (item.result === '-') return [];
  if (item.goalLine === 'J1' && item.result === 'h') return [1];
  if (item.goalLine === 'J1' && item.result === 'd') return [];
  if (item.goalLine === 'J1' && item.result === 'a') return [-1];

  if (item.goalLine === 'J2' && item.result === 'h') return [2];
  if (item.goalLine === 'J2' && item.result === 'd') return [];
  if (item.goalLine === 'J2' && item.result === 'a') return [-2];

  if (item.goalLine === 'J3' && item.result === 'h') return [3];
  if (item.goalLine === 'J3' && item.result === 'd') return [];
  if (item.goalLine === 'J3' && item.result === 'a') return [-3];
  const goalLineNumberList = getGoalLineNumberList(item.goalLine);
  const winGoalList = range(-20, 20).filter((i) => {
    if (item.result === 'a' && item.goalLine === '-') return i < 0;
    if (item.result === 'h' && item.goalLine === '-') return i > 0;
    if (item.result === 'd' && item.goalLine === '-') return i === 0;
    if (item.result === 'a') return goalLineNumberList.every((g) => i + g < 0);
    if (item.result === 'h') return goalLineNumberList.every((g) => i + g > 0);
    if (item.result === 'd') return goalLineNumberList.every((g) => i + g === 0);
    return false;
  });
  return winGoalList;
}

function getBettingResult(
  r1: { goalLine: GoalLine; result: 'h' | 'd' | 'a' | '-'; isJC: boolean },
  r2: { goalLine: GoalLine; result: 'h' | 'd' | 'a' | '-'; isJC: boolean }
) {
  if (r1.result === '-' || r2.result === '-') return BETTING_RESULT.unableDetermine;
  const winGoalList = getWinGoalList(r1);
  if (!winGoalList?.length) return BETTING_RESULT.unableDetermine;
  if (r2.goalLine === 'J1' && r2.result === 'h' && everyWithTolerance(winGoalList, (g) => g === 1)) return BETTING_RESULT.win;
  if (r2.goalLine === 'J1' && r2.result === 'a' && everyWithTolerance(winGoalList, (g) => g === -1)) return BETTING_RESULT.win;
  if (r2.goalLine === 'J1' && r2.result === 'h' && everyWithTolerance(winGoalList, (g) => g !== 1)) return BETTING_RESULT.lose;
  if (r2.goalLine === 'J1' && r2.result === 'a' && everyWithTolerance(winGoalList, (g) => g !== -1)) return BETTING_RESULT.lose;

  if (r2.goalLine === 'J2' && r2.result === 'h' && everyWithTolerance(winGoalList, (g) => g === 2)) return BETTING_RESULT.win;
  if (r2.goalLine === 'J2' && r2.result === 'a' && everyWithTolerance(winGoalList, (g) => g === -2)) return BETTING_RESULT.win;
  if (r2.goalLine === 'J2' && r2.result === 'h' && everyWithTolerance(winGoalList, (g) => g !== 2)) return BETTING_RESULT.lose;
  if (r2.goalLine === 'J2' && r2.result === 'a' && everyWithTolerance(winGoalList, (g) => g !== -2)) return BETTING_RESULT.lose;

  if (r2.goalLine === 'J3' && r2.result === 'h' && everyWithTolerance(winGoalList, (g) => g === 3)) return BETTING_RESULT.win;
  if (r2.goalLine === 'J3' && r2.result === 'a' && everyWithTolerance(winGoalList, (g) => g === -3)) return BETTING_RESULT.win;
  if (r2.goalLine === 'J3' && r2.result === 'h' && everyWithTolerance(winGoalList, (g) => g !== 3)) return BETTING_RESULT.lose;
  if (r2.goalLine === 'J3' && r2.result === 'a' && everyWithTolerance(winGoalList, (g) => g !== -3)) return BETTING_RESULT.lose;
  /**把0.25转化为[0,0.5]格式 ,1=>[1,1], 0.75=>[0.5,1] */
  const r2GoalLineNumberList = getGoalLineNumberList(r2.goalLine);
  if (r2.result === 'a') {
    const betResultList = r2GoalLineNumberList.map((r2g) => {
      // r2是jc时 平局算输掉
      if (everyWithTolerance(winGoalList, (g) => g + r2g === 0 && r2.isJC)) return BETTING_RESULT.lose;
      // goalLine是独赢的时候 平局算输掉
      if (everyWithTolerance(winGoalList, (g) => g + r2g === 0 && r2.goalLine === '-')) return BETTING_RESULT.lose;
      if (everyWithTolerance(winGoalList, (g) => g + r2g < 0)) return BETTING_RESULT.win;
      if (everyWithTolerance(winGoalList, (g) => g + r2g === 0)) return BETTING_RESULT.refund;
      if (everyWithTolerance(winGoalList, (g) => g + r2g > 0)) return BETTING_RESULT.lose;
      return BETTING_RESULT.unableDetermine;
    }) as [BETTING_RESULT, BETTING_RESULT];
    return getBettingResultByBettingList(betResultList);
  }
  if (r2.result === 'h') {
    const betResultList = r2GoalLineNumberList.map((r2g) => {
      // r2是jc时 平局算输掉
      if (everyWithTolerance(winGoalList, (g) => g + r2g === 0 && r2.isJC)) return BETTING_RESULT.lose;
      // goalLine是独赢的时候 平局算输掉
      if (everyWithTolerance(winGoalList, (g) => g + r2g === 0 && r2.goalLine === '-')) return BETTING_RESULT.lose;
      if (everyWithTolerance(winGoalList, (g) => g + r2g > 0)) return BETTING_RESULT.win;
      if (everyWithTolerance(winGoalList, (g) => g + r2g === 0)) return BETTING_RESULT.refund;
      if (everyWithTolerance(winGoalList, (g) => g + r2g < 0)) return BETTING_RESULT.lose;
      return BETTING_RESULT.unableDetermine;
    }) as [BETTING_RESULT, BETTING_RESULT];
    return getBettingResultByBettingList(betResultList);
  }
  if (r2.result === 'd') {
    const betResultList = r2GoalLineNumberList.map((r2g) => {
      // r2是jc时 平局算赢
      if (everyWithTolerance(winGoalList, (g) => g + r2g === 0 && r2.isJC)) return BETTING_RESULT.win;
      // goalLine是独赢的时候 平局算输掉
      if (everyWithTolerance(winGoalList, (g) => g + r2g === 0 && r2.goalLine === '-')) return BETTING_RESULT.win;
      if (everyWithTolerance(winGoalList, (g) => g + r2g > 0)) return BETTING_RESULT.lose;
      if (everyWithTolerance(winGoalList, (g) => g + r2g === 0)) return BETTING_RESULT.refund;
      if (everyWithTolerance(winGoalList, (g) => g + r2g < 0)) return BETTING_RESULT.lose;
      return BETTING_RESULT.unableDetermine;
    }) as [BETTING_RESULT, BETTING_RESULT];
    return getBettingResultByBettingList(betResultList);
  }
  return BETTING_RESULT.unableDetermine;
}

/**
 * 获取四元一次方程的系数
 * 获取方程系数 在r1的比赛结果下，获取r2的方程系数
 * @param isJc  这个规则是否来自jc
 * @returns
 */
export const getCoefficient = (
  r1: { result: Result; goalLine: GoalLine; isJC: boolean },
  r2: {
    result: Result;
    goalLine: GoalLine;
    odds: number;
    isJC: boolean;
  },
  op: GlobalOptions
) => {
  /**当前的状态 */
  const { odds } = r2;
  if (odds === 0 || r1.result === '-' || r2.result === '-') return 0;
  const betResult = getBettingResult(r1, r2);
  if (betResult === BETTING_RESULT.win && r2.isJC) {
    return odds - 1 + op.JCPointSin;
  }
  if (betResult === BETTING_RESULT.lose && r2.isJC) {
    return op.JCPointSin - 1;
  }
  if (betResult === BETTING_RESULT.win && !r2.isJC) {
    return odds - 1 + (odds - 1) * op.HGPoint;
  }
  if (betResult === BETTING_RESULT.lose && !r2.isJC) {
    return op.HGPoint - 1;
  }
  if (betResult === BETTING_RESULT.halfLose && !r2.isJC) {
    return (op.HGPoint - 1) * 0.5;
  }
  if (betResult === BETTING_RESULT.halfWin && !r2.isJC) {
    return (odds - 1) * 0.5 + (odds - 1) * op.HGPoint * 0.5;
  }
  if (betResult === BETTING_RESULT.halfWinLose && !r2.isJC) {
    return (odds - 1 + (odds - 1) * op.HGPoint) * 0.5 + (op.HGPoint - 1) * 0.5;
  }
  if (betResult === BETTING_RESULT.refund && !r2.isJC) {
    return 0;
  }
  if (betResult === BETTING_RESULT.unableDetermine && !r2.isJC) {
    return 0;
  }
  return 0;
};

// console.log(123, getBettingResult({ goalLine: 'J1', result: 'a', isJC: false }, { goalLine: '1', result: 'h', isJC: true }));
// console.log(123, getBettingResult({ goalLine: 'J1', result: 'a', isJC: false }, { goalLine: '1', result: 'a', isJC: true }));

/**
 *获取利润
 * @param JCInfo
 * @param HGInfo
 * @param op
 * @returns
 */
 export function getMatchSinData(JCInfo: JCInfo, HGInfo: HGInfo, op: GlobalOptions) {
  const goalLineRuleList = getSinRuleList();
  const jcGoalLineItem1 = { goalLine: '-', a: JCInfo.had_a, d: JCInfo.had_d, h: JCInfo.had_h };
  const jcGoalLineItem2 = { goalLine: JCInfo.hhad_goalLine, a: JCInfo.hhad_a, d: JCInfo.hhad_d, h: JCInfo.hhad_h };
  const hgGoalLineItem1 = { goalLine: '-', a: HGInfo.had_a, d: HGInfo.had_d, h: HGInfo.had_h };
  const hgGoalLineItem2 = { goalLine: HGInfo.hhad_goalLine1, a: HGInfo.hhad_a1, d: HGInfo.hhad_d1, h: HGInfo.hhad_h1 };
  const hgGoalLineItem3 = { goalLine: HGInfo.hhad_goalLine2, a: HGInfo.hhad_a2, d: HGInfo.hhad_d2, h: HGInfo.hhad_h2 };
  const hgGoalLineItem4 = { goalLine: HGInfo.hhad_goalLine3, a: HGInfo.hhad_a3, d: HGInfo.hhad_d3, h: HGInfo.hhad_h3 };
  const hgGoalLineItem5 = { goalLine: HGInfo.hhad_goalLine4, a: HGInfo.hhad_a4, d: HGInfo.hhad_d4, h: HGInfo.hhad_h4 };
  const hgGoalLineItem6 = { goalLine: HGInfo.hhad_goalLine5, a: HGInfo.hhad_a5, d: HGInfo.hhad_d5, h: HGInfo.hhad_h5 };
  const hgGoalLineItem7 = { goalLine: HGInfo.hhad_goalLine6, a: HGInfo.hhad_a6, d: HGInfo.hhad_d6, h: HGInfo.hhad_h6 };
  const hgGoalLineItem8 = { goalLine: 'J1', a: HGInfo.wm_a1, d: '-', h: HGInfo.wm_h1 };
  const hgGoalLineItem9 = { goalLine: 'J2', a: HGInfo.wm_a2, d: '-', h: HGInfo.wm_h2 };
  const hgGoalLineItem10 = { goalLine: 'J3', a: HGInfo.wm_a3, d: '-', h: HGInfo.wm_h3 };
  const hgGoalLineItemList = [
    hgGoalLineItem1,
    hgGoalLineItem2,
    hgGoalLineItem3,
    hgGoalLineItem4,
    hgGoalLineItem5,
    hgGoalLineItem6,
    hgGoalLineItem7,
    hgGoalLineItem8,
    hgGoalLineItem9,
    hgGoalLineItem10,
  ].filter((item) => item.a !== '-' && item.a);
  const jcGoalLineItemList = [jcGoalLineItem1, jcGoalLineItem2].filter((item) => item.a !== '-' && item.a);
  return goalLineRuleList
    .map((rule) => {
      const jcResult1 = rule.jcResult1;
      const jcResult2 = rule.jcResult2;
      const jcGoalLine1 = rule.jcGoalLine1;
      const jcGoalLine2 = rule.jcGoalLine2;
      const hgResult1 = rule.hgResult1;
      const hgResult2 = rule.hgResult2;
      const hgGoalLine1 = rule.hgGoalLine1;
      const hgGoalLine2 = rule.hgGoalLine2;
      const finedJcItem1 = jcGoalLineItemList.find((jcItem) => jcItem.goalLine === jcGoalLine1);
      const finedJcItem2 = jcGoalLineItemList.find((jcItem) => jcItem.goalLine === jcGoalLine2);
      const finedHgItem1 = hgGoalLineItemList.find((hgItem) => hgItem.goalLine === hgGoalLine1);
      const finedHgItem2 = hgGoalLineItemList.find((hgItem) => hgItem.goalLine === hgGoalLine2);
      if (!finedJcItem1 || !finedHgItem1) return void 0;
      if (rule.jcResult2 !== '-' && !finedJcItem2) return void 0;
      if (rule.hgResult2 !== '-' && !finedHgItem2) return void 0;
      // @ts-expect-error
      const jcOdds1 = toNumber(finedJcItem1?.[jcResult1]);
      // @ts-expect-error
      const jcOdds2 = toNumber(finedJcItem2?.[jcResult2]);
      // @ts-expect-error
      const hgOdds1 = toNumber(finedHgItem1?.[hgResult1]);
      // @ts-expect-error
      const hgOdds2 = toNumber(finedHgItem2?.[hgResult2]);
      const sinData = getSinData(
        {
          jcResult1,
          jcResult2,
          hgResult1,
          hgResult2,
          jcGoalLine1,
          jcGoalLine2,
          hgGoalLine1,
          hgGoalLine2,
          jcOdds1,
          jcOdds2,
          hgOdds1,
          hgOdds2,
          matchTimeFormat: JCInfo.matchTimeFormat,
        },
        op
      );
      if (!sinData) return void 0;
      return {
        matchId: JCInfo.matchId,
        JCgoalLine: jcGoalLine1,
        HGgoalLine: hgGoalLine1,
        rule: rule,
        data: sinData,
      };
    })
    .filter((v): v is Exclude<typeof v, undefined> => !!v);
}

export function getSinData(
  item: {
    jcResult1: Result;
    jcResult2: Result;
    jcGoalLine1: GoalLine;
    jcGoalLine2: GoalLine;
    hgResult1: Result;
    hgResult2: Result;
    hgGoalLine1: GoalLine;
    hgGoalLine2: GoalLine;
    jcOdds1: number;
    jcOdds2: number;
    hgOdds1: number;
    hgOdds2: number;
    matchTimeFormat: string;
  },
  op: GlobalOptions
): DataOfSinInfo | undefined {
  const {
    jcResult1,
    jcResult2,
    jcGoalLine1,
    jcGoalLine2,
    hgResult1,
    hgResult2,
    hgGoalLine1,
    hgGoalLine2,
    jcOdds1,
    jcOdds2,
    hgOdds1,
    hgOdds2,
    matchTimeFormat,
  } = item;
  // x=jc2 y=hg1 z=hg2 w=profit

  // jc1 等式
  const a1 =
    jcOdds1 === 0
      ? 0
      : getCoefficient(
          { result: jcResult1, isJC: true, goalLine: jcGoalLine1 },
          { result: jcResult2, isJC: true, goalLine: jcGoalLine2, odds: jcOdds2 },
          op
        );
  const b1 =
    jcOdds1 === 0
      ? 0
      : getCoefficient(
          { result: jcResult1, isJC: true, goalLine: jcGoalLine1 },
          { result: hgResult1, isJC: false, goalLine: hgGoalLine1, odds: hgOdds1 },
          op
        );
  const c1 =
    jcOdds1 === 0
      ? 0
      : getCoefficient(
          { result: jcResult1, isJC: true, goalLine: jcGoalLine1 },
          { result: hgResult2, isJC: false, goalLine: hgGoalLine2, odds: hgOdds2 },
          op
        );
  const d1 = jcOdds1 === 0 ? 0 : -1;
  const e1 =
    jcOdds1 === 0
      ? 0
      : -getCoefficient(
          { result: jcResult1, isJC: true, goalLine: jcGoalLine1 },
          { result: jcResult1, isJC: true, goalLine: jcGoalLine1, odds: jcOdds1 },
          op
        ) * op.JCBet;

  // jc2等式
  const a2 =
    jcOdds2 === 0
      ? 0
      : getCoefficient(
          { result: jcResult2, isJC: true, goalLine: jcGoalLine2 },
          { result: jcResult2, isJC: true, goalLine: jcGoalLine2, odds: jcOdds2 },
          op
        );
  const b2 =
    jcOdds2 === 0
      ? 0
      : getCoefficient(
          { result: jcResult2, isJC: true, goalLine: jcGoalLine2 },
          { result: hgResult1, isJC: false, goalLine: hgGoalLine1, odds: hgOdds1 },
          op
        );
  const c2 =
    jcOdds2 === 0
      ? 0
      : getCoefficient(
          { result: jcResult2, isJC: true, goalLine: jcGoalLine2 },
          { result: hgResult2, isJC: false, goalLine: hgGoalLine2, odds: hgOdds2 },
          op
        );
  const d2 = jcOdds2 === 0 ? 0 : -1;
  const e2 =
    jcOdds2 === 0
      ? 0
      : -getCoefficient(
          { result: jcResult2, isJC: true, goalLine: jcGoalLine2 },
          { result: jcResult1, isJC: true, goalLine: jcGoalLine1, odds: jcOdds1 },
          op
        ) * op.JCBet;

  // hg1等式
  const a3 =
    hgOdds1 === 0
      ? 0
      : getCoefficient(
          { result: hgResult1, isJC: false, goalLine: hgGoalLine1 },
          { result: jcResult2, isJC: true, goalLine: jcGoalLine2, odds: jcOdds2 },
          op
        );
  const b3 =
    hgOdds1 === 0
      ? 0
      : getCoefficient(
          { result: hgResult1, isJC: false, goalLine: hgGoalLine1 },
          { result: hgResult1, isJC: false, goalLine: hgGoalLine1, odds: hgOdds1 },
          op
        );
  const c3 =
    hgOdds1 === 0
      ? 0
      : getCoefficient(
          { result: hgResult1, isJC: false, goalLine: hgGoalLine1 },
          { result: hgResult2, isJC: false, goalLine: hgGoalLine2, odds: hgOdds2 },
          op
        );
  const d3 = hgOdds1 === 0 ? 0 : -1;
  const e3 =
    hgOdds1 === 0
      ? 0
      : -getCoefficient(
          { result: hgResult1, isJC: false, goalLine: hgGoalLine1 },
          { result: jcResult1, isJC: true, goalLine: jcGoalLine1, odds: jcOdds1 },
          op
        ) * op.JCBet;

  // hg2等式
  const a4 =
    hgOdds2 === 0
      ? 0
      : getCoefficient(
          { result: hgResult2, isJC: false, goalLine: hgGoalLine2 },
          { result: jcResult2, isJC: true, goalLine: jcGoalLine2, odds: jcOdds2 },
          op
        );
  const b4 =
    hgOdds2 === 0
      ? 0
      : getCoefficient(
          { result: hgResult2, isJC: false, goalLine: hgGoalLine2 },
          { result: hgResult1, isJC: false, goalLine: hgGoalLine1, odds: hgOdds1 },
          op
        );
  const c4 =
    hgOdds2 === 0
      ? 0
      : getCoefficient(
          { result: hgResult2, isJC: false, goalLine: hgGoalLine2 },
          { result: hgResult2, isJC: false, goalLine: hgGoalLine2, odds: hgOdds2 },
          op
        );
  const d4 = hgOdds2 === 0 ? 0 : -1;
  const e4 =
    hgOdds2 === 0
      ? 0
      : -getCoefficient(
          { result: hgResult2, isJC: false, goalLine: hgGoalLine2 },
          { result: jcResult1, isJC: true, goalLine: jcGoalLine1, odds: jcOdds1 },
          op
        ) * op.JCBet;

  const [jcBet2, hgBet1, hgBet2, profit] = getGaussElimination(
    [
      [a1, b1, c1, d1],
      [a2, b2, c2, d2],
      [a3, b3, c3, d3],
      [a4, b4, c4, d4],
    ],
    [e1, e2, e3, e4]
  ) || [0, 0, 0, 0];
  const jcRebate2 = op.JCPointSin * jcBet2;
  const jcAmount2 = jcBet2 * jcOdds2;
  const hgRebate1 = hgBet1 * (hgOdds1 - 1) * op.HGPoint;
  const hgAmount1 = hgBet1 * hgOdds1;
  const hgRebate2 = hgBet2 * (hgOdds2 - 1) * op.HGPoint;
  const hgAmount2 = hgBet2 * hgOdds2;
  const profitRate = `${toFixNumber((profit / (op.JCBet + jcBet2)) * 100, 2)}%` as `${number}%`;
  /** 竞彩 中奖金额*/
  const jcAmount1 = jcOdds1 * op.JCBet;
  /** 竞彩 返利金额*/
  const jcRebate1 = op.JCBet * op.JCPointSin;

  if (profit === 0) return void 0;
  const ret = getRet(jcOdds1, jcOdds2, hgOdds1, hgOdds2);
  const method = getMethod({
    jcGoalLine1,
    jcResult1,
    jcGoalLine2,
    jcResult2,
    hgGoalLine1,
    hgResult1,
    hgGoalLine2,
    hgResult2,
  });
  return {
    JCgoalLine1: jcGoalLine1,
    JCgoalLine2: jcGoalLine2,
    HGgoalLine1: hgGoalLine1,
    HGgoalLine2: hgGoalLine2,
    jcOdds1: jcOdds1,
    jcOdds2: jcOdds2,
    hgOdds1: hgOdds1,
    hgOdds2: hgOdds2,
    JCTouz1: jcResult1,
    JCTouz2: jcResult2,
    HGTouz1: hgResult1,
    HGTouz2: hgResult2,
    method,
    matchTimeFormat: matchTimeFormat,
    jcBet1: op.JCBet,
    jcBet2: toFixNumber(jcBet2, 3),
    hgBet1: toFixNumber(hgBet1, 3),
    hgBet2: toFixNumber(hgBet2, 3),
    JCPoint1: toFixNumber(jcRebate1, 3),
    JCPoint2: toFixNumber(jcRebate2, 3),
    HGPoint1: toFixNumber(hgRebate1, 3),
    HGPoint2: toFixNumber(hgRebate2, 3),
    jcAmount1: toFixNumber(jcAmount1, 3),
    jcAmount2: toFixNumber(jcAmount2, 3),
    hgAmount1: toFixNumber(hgAmount1, 3),
    hgAmount2: toFixNumber(hgAmount2, 3),
    ret: `${(ret * 100).toFixed(3)}%` as `${number}%`,
    profit: toFixNumber(profit, 3),
    profitRate,
  };
}
/**获取返率 */
const getRet = (a: number, b: number, c: number, d: number) => {
  const nList = [a, b, c, d].filter((n) => !!n);
  if (nList.length === 0) return 0;
  if (nList.length === 1) return 1;
  if (nList.length === 2) {
    const [n1, n2] = nList;
    return (n1 * n2) / (n1 + n2);
  }
  if (nList.length === 3) {
    const [n1, n2, n3] = nList;
    return (n1 * n2 * n3) / (n1 * n2 + n1 * n3 + n2 * n3);
  }
  const [n1, n2, n3, n4] = nList;
  return (n1 * n2 * n3 * n4) / (n1 * n2 * n3 + n1 * n2 * n4 + n1 * n3 * n4 + n2 * n3 * n4);
};
