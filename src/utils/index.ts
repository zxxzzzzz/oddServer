import { randomUUID } from 'crypto';
import { GlobalOptions, GoalLine, HGInfo, JCInfo, Result, SinInfo, DataOfSinInfo, ChuanInfo } from '../type/index.js';
import { getCoefficient, getGoalLineRuleList } from './sinRule.js';
import { getGaussElimination, toFixNumber, toNumber } from './lodash.js';
import { getMethod } from './methodRule.js';
export * from './lodash.js';
export * from './sinRule.js';
export * from './chuanRule.js';

/**计算最大可能的编辑距离 
 *  - 示例使用
    ```const s1 = "你好世界";```  
    ```const s2 = "你好世间";```  
    ``` // 输出：0.75```  
    ```console.log(`归一化编辑距离: ${normalizedLevenshteinDistance(s1, s2).toFixed(2)}`);```
*/
function getStrSameWeight(s1: string, s2: string): number {
  const len1 = s1.length;
  const len2 = s2.length;

  // 如果其中一个字符串为空，则返回另一个字符串的长度
  if (len1 === 0) return 1.0;
  if (len2 === 0) return 1.0;

  // 创建一个二维数级来存储子问题的结果
  const matrix: number[][] = Array.from({ length: len1 + 1 }, () => Array(len2 + 1).fill(0));

  // 初始化第一行和第一列
  for (let i = 0; i <= len1; i++) {
    matrix[i][0] = i;
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  // 动态规划填充矩阵
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // 删除
        matrix[i][j - 1] + 1, // 插入
        matrix[i - 1][j - 1] + cost // 替换
      );
    }
  }

  // 计算最大可能的编辑距离
  const maxLength = Math.max(len1, len2);

  // 返回归一化的编辑距离
  return 1 - matrix[len1][len2] / maxLength;
}

/**获取联赛相似度权重 完全相似就是1*/
export const getLeagueSameWeight = (leagueName1: string, leagueName2: string) => {
  const l1 = leagueName1
    .toString()
    .replace(/组/g, '级')
    .replace(/(-|附加赛|升级)/g, '');
  const l2 = leagueName2
    .toString()
    .replace(/组/g, '级')
    .replace(/(-|附加赛|升级)/g, '');
  const equalNameList = [
    ['日本职业联赛杯', '日本联赛杯'],
    ['澳大利亚超级联赛', '澳大利亚甲级联赛', '澳大利亚甲级联赛'],
    ['欧罗巴联赛', '欧洲联赛'],
    ['韩国K甲级联赛', '韩国职业联赛'],
    ['日本J1联赛', '日本职业联赛'],
    ['日本J2联赛', '日本职业乙级联赛', '日本乙级联赛'],
    ['英格兰冠军联赛-附加赛', '英格兰冠军联赛'],
    ['世界U20锦标赛', 'U20世界杯2023(在阿根廷)'],
    ['美国公开赛冠军杯', '美国公开赛杯'],
    ['南美解放者杯', '南美自由杯'],
    ['欧洲国家联赛', '欧洲国家联赛A', '欧洲国家联赛B', '欧洲国家联赛C', '欧洲国家联赛D'],
    ['欧洲杯预选赛', '欧洲足球锦标赛2024外围赛'],
    ['国际赛', '国际友谊赛'],
    ['国际赛', '美洲国家联赛A'],
    ['欧洲U21锦标赛', '欧洲U21青年锦标赛2023(在罗马尼亚和格鲁吉亚)'],
    ['中北美金杯赛', '美洲金杯2023(在美国和加拿大)'],
    ['欧洲冠军联赛外围赛', '欧洲冠军联赛'],
    ['女足世界杯', '女子世界杯2023(在澳大利亚和纽西兰)'],
    ['英格兰联赛锦标赛', '英格兰锦标赛'],
    ['欧罗巴联赛', '欧洲联赛'],
    ['欧罗巴联赛', '欧洲联赛外围赛'],
    ['世界杯2026南美洲外围赛', '世界杯预选赛'],
    ['亚运会男足', '亚运会2022男子足球U23(在中国)'],
    ['亚洲冠军联赛', '亚足联冠军联赛'],
    ['世界杯预选赛', '世界杯2026亚洲外围赛', '世界杯2026南美洲外围赛', '世界杯2026非洲外围赛'],
    ['西班牙篮球联赛', '西班牙篮球甲级联赛'],
    ['美国职业篮球联盟', 'NBA美国职业篮球联赛'],
    ['美国职业篮球联盟', 'NBA美国职业篮球联赛'],
    ['亚洲杯', '亚洲杯2023(在卡塔尔)'],
    ['非洲国家杯', '非洲国家杯2023(在象牙海岸)'],
    ['瑞典超级甲组联赛', '瑞典超级甲组联赛-附加赛', '瑞典超级甲组联赛']
  ];
  const isEqual = !!equalNameList.some((d) => d.includes(l1) && d.includes(l2));
  if (isEqual) {
    return 1;
  }
  return getStrSameWeight(l1, l2);
};

/**获取队伍相似度权重 */
export const getTeamSameWeight = (teamName1: string, teamName2: string) => {
  const equalTeamList = [
    ['博德闪耀', '波杜基林特'],
    ['腓特烈', '费德列斯达'],
  ];
  const isEqual = !!equalTeamList.some((d) => d.includes(teamName1) && d.includes(teamName2));
  if (isEqual) {
    return 1;
  }
  return getStrSameWeight(teamName1, teamName2);
};

/**把 2/5 = (2+5)/2 */
export const getRatioAvg = (str: string, isNegative: boolean) => {
  if (!str) return 0;
  const splitCount = str.split('/').length;
  let count = str.split('/').reduce((re, cur) => re + Math.abs(parseFloat(cur)), 0) / splitCount;
  if (isNegative) {
    count = -count;
  }
  if (count === 0) return '0';
  // 去除末尾的0和小数点
  return count
    .toString()
    .replace(/(\.\d*?[1-9])0+$/, '$1')
    .replace(/\.$/, '');
};

/**
 *获取利润
 * @param JCInfo
 * @param HGInfo
 * @param op
 * @returns
 */
export function getMatchSinData(JCInfo: JCInfo, HGInfo: HGInfo, op: GlobalOptions) {
  const goalLineRuleList = getGoalLineRuleList();
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
  const profitRate = `${toFixNumber((profit / (op.JCBet + jcBet2)) * 100, 3)}%` as `${number}%`;
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
