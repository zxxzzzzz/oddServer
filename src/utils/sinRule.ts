import { readFileSync, writeFileSync } from 'fs';
import { BETTING_RESULT, GlobalOptions, GoalLine, SinRule, Result, SinInfo } from '../type/index.js';
import { everyWithTolerance, range, uniqBy } from './index.js';
import path from 'path';

let GlobalGoalLineRuleList: SinRule[] = [];
const FILE_PATH = path.resolve(import.meta.dirname, '../../cache/sinRule.csv');
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
  const uniqItemList = uniqBy(itemList, (item) => CSV_HEAD.map((key) => item[key]).join(',')).sort((a, b) => {
    const jm = { J1: 1, J2: 2, J3: 3 };
    const aIndex =
      (a.jcGoalLine1 === '-' ? 0 : parseFloat(a.jcGoalLine1)) * 1000 +
      (a.jcGoalLine2 === '-' ? 0 : parseFloat(a.jcGoalLine2)) * 100 +
      // @ts-expect-error
      (a.hgGoalLine1 === '-' ? 0 : parseFloat(['J1', 'J2', 'J2'].includes(a.hgGoalLine1) ? jm[a.hgGoalLine1] : a.hgGoalLine1)) * 10 +
      // @ts-expect-error
      (a.hgGoalLine2 === '-' ? 0 : parseFloat(['J1', 'J2', 'J2'].includes(a.hgGoalLine2) ? jm[a.hgGoalLine2] : a.hgGoalLine2)) * 1;
    const bIndex =
      (b.jcGoalLine1 === '-' ? 0 : parseFloat(b.jcGoalLine1)) * 1000 +
      (b.jcGoalLine2 === '-' ? 0 : parseFloat(b.jcGoalLine2)) * 100 +
      // @ts-expect-error
      (b.hgGoalLine1 === '-' ? 0 : parseFloat(['J1', 'J2', 'J2'].includes(b.hgGoalLine1) ? jm[b.hgGoalLine1] : b.hgGoalLine1)) * 10 +
      // @ts-expect-error
      (b.hgGoalLine2 === '-' ? 0 : parseFloat(['J1', 'J2', 'J2'].includes(b.hgGoalLine2) ? jm[b.hgGoalLine2] : b.hgGoalLine2)) * 1;
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
