import { writeFileSync, existsSync, readFileSync } from 'fs';
import { GlobalOptions, HGInfo, JCInfo } from 'src/type/index.js';
export * from './lodash.js'

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

/**获取联赛相似度权重 */
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
    ['欧洲国家联赛', '欧洲国家联赛A'],
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
  ];
  const isEqual = !!equalNameList.some((d) => d.includes(l1) && d.includes(l2));
  if (isEqual) {
    return 1;
  }
  return getStrSameWeight(l1, l2);
};

/**获取队伍相似度权重 */
export const getTeamSameWeight = (teamName1: string, teamName2: string) => {
  return getStrSameWeight(teamName1, teamName2);
};



/**把 2/5 = (2+5)/2 */
export const getRatioAvg = (str: string, isNegative: boolean) => {
  if (!str) return 0;
  let count = str.split('/').reduce((re, cur) => re + parseFloat(cur), 0) / 2;
  if (isNegative) {
    count = -count;
  }
  if (count === 0) return '0';
  return count.toFixed(2);
};




/**
 *
 * @param JCOdd 竞采赔率
 * @param HGOdd HG赔率
 * @param HGPoint HG返点
 * @param JCPointSin JC单返点
 * @returns
 */
export function getRev(JCOdd: number, HGOdd: number, HGPoint: number, JCPointSin: number) {
  const I25 = JCPointSin;
  const GC = JCOdd;
  const F23 = GC;
  const VV = JCOdd * HGOdd > 3 ? HGOdd - 1 : HGOdd;
  const G23 = VV;
  const addedHGPoint = 1 + HGPoint;
  const minusHGPoint = 1 - HGPoint;
  const Offset = (10000 * F23) / (addedHGPoint * G23 + minusHGPoint);
  const H23 = Offset;
  const Rev = F23 * 10000 - 10000 * (1 - I25) - 0.972 * H23;
  return {
    GC,
    VV,
    Offset,
    Rev,
  };
}
/**
 *
 * @param item1
 * @param item2
 * @param HGPoint HG返点
 * @param JCPointChuan JC串返点
 * @param JCTzAmt JC投注
 */
export function getCompare(
  item1: { GC: number; VV: number; Offset: number; Rev: number },
  item2: { GC: number; VV: number; Offset: number; Rev: number },
  HGPoint: number,
  JCPointChuan: number,
  JCTzAmt: number
) {
  const G37 = item1.GC;
  const G38 = item2.GC;
  const H37 = item1.VV;
  const H38 = item2.VV;
  const I40 = JCPointChuan;
  const addedHGPoint = 1 + HGPoint;
  const minusHGPoint = 1 - HGPoint;
  const item2CompareOffset = (G37 * G38 * 10000) / (addedHGPoint * H38 + minusHGPoint);
  const I38 = item2CompareOffset;
  const item1CompareOffset =
    (addedHGPoint * H38 * I38 - (10000 * (1 - I40) * 7) / 8) / ((addedHGPoint * H37) / 8 + minusHGPoint);
  const I37 = item1CompareOffset;
  const item2CompareRev = I38 * H38 * addedHGPoint - I37 * minusHGPoint - 10000 * (1 - I40);
  const item1CompareRev = I37 * H37 * 1.028 - 10000 * (1 - I40);
  const item1Amount = item1CompareOffset * JCTzAmt;
  const item2Amount = item2CompareOffset * JCTzAmt;
  return {
    item1: {
      GC: item1.GC,
      VV: item1.VV,
      Offset: item1CompareOffset,
      Rev: item1CompareRev,
      Amount: item1Amount,
    },
    item2: {
      GC: item2.GC,
      VV: item2.VV,
      Offset: item2CompareOffset,
      Rev: item2CompareRev,
      Amount: item2Amount,
    },
  };
}








/**
 *获取利润对比
 * @param JCInfo
 * @param HGInfo
 * @param op {JCBet} JCBet 竞彩投注
 * @returns
 */
function getSinData(JCInfo: JCInfo, HGInfo: HGInfo, op: GlobalOptions) {
  enum ResultType {
    'win' = 'h',
    'lose' = 'a',
    'draw' = 'd',
  }
  // '-'=独赢
  const JCGoalLineList: { goalLine: number; type: ResultType; odds: number }[] = [
    { goalLine: '-', type: ResultType.win, odds: JCInfo.had_h },
    { goalLine: '-', type: ResultType.lose, odds: JCInfo.had_a },
    { goalLine: '-', type: ResultType.draw, odds: JCInfo.had_d },
    { goalLine: JCInfo.hhad_goalLine, type: ResultType.win, odds: JCInfo.hhad_h },
    { goalLine: JCInfo.hhad_goalLine, type: ResultType.lose, odds: JCInfo.hhad_a },
    { goalLine: JCInfo.hhad_goalLine, type: ResultType.draw, odds: JCInfo.hhad_d },
  ]
    .map((item) => {
      return { goalLine: parseFloat(item.goalLine), odds: parseFloat(item.odds), type: item.type };
    })
    .filter((item) => item.odds && item.goalLine);
  const HGGoalLineList: { goalLine: number | '-'; type: ResultType; odds: number }[] = [
    { goalLine: '-', type: ResultType.win, odds: HGInfo.had_h },
    { goalLine: '-', type: ResultType.lose, odds: HGInfo.had_a },
    { goalLine: '-', type: ResultType.draw, odds: HGInfo.had_d },

    { goalLine: HGInfo.hhad_goalLine1, type: ResultType.win, odds: HGInfo.hhad_h1 },
    { goalLine: HGInfo.hhad_goalLine1, type: ResultType.lose, odds: HGInfo.hhad_a1 },
    { goalLine: HGInfo.hhad_goalLine1, type: ResultType.draw, odds: HGInfo.hhad_d1 },

    { goalLine: HGInfo.hhad_goalLine2, type: ResultType.win, odds: HGInfo.hhad_h2 },
    { goalLine: HGInfo.hhad_goalLine2, type: ResultType.lose, odds: HGInfo.hhad_a2 },
    { goalLine: HGInfo.hhad_goalLine2, type: ResultType.draw, odds: HGInfo.hhad_d2 },

    { goalLine: HGInfo.hhad_goalLine3, type: ResultType.win, odds: HGInfo.hhad_h3 },
    { goalLine: HGInfo.hhad_goalLine3, type: ResultType.lose, odds: HGInfo.hhad_a3 },
    { goalLine: HGInfo.hhad_goalLine3, type: ResultType.draw, odds: HGInfo.hhad_d3 },

    { goalLine: HGInfo.hhad_goalLine4, type: ResultType.win, odds: HGInfo.hhad_h4 },
    { goalLine: HGInfo.hhad_goalLine4, type: ResultType.lose, odds: HGInfo.hhad_a4 },
    { goalLine: HGInfo.hhad_goalLine4, type: ResultType.draw, odds: HGInfo.hhad_d4 },

    { goalLine: HGInfo.hhad_goalLine5, type: ResultType.win, odds: HGInfo.hhad_h5 },
    { goalLine: HGInfo.hhad_goalLine5, type: ResultType.lose, odds: HGInfo.hhad_a5 },
    { goalLine: HGInfo.hhad_goalLine5, type: ResultType.draw, odds: HGInfo.hhad_d5 },

    { goalLine: HGInfo.hhad_goalLine6, type: ResultType.win, odds: HGInfo.hhad_h6 },
    { goalLine: HGInfo.hhad_goalLine6, type: ResultType.lose, odds: HGInfo.hhad_a6 },
    { goalLine: HGInfo.hhad_goalLine6, type: ResultType.draw, odds: HGInfo.hhad_d6 },
  ]
    .map((item) => {
      return {
        goalLine: (item.goalLine === '-' ? '-' : parseFloat(item.goalLine)) as number | '-',
        odds: parseFloat(item.odds),
        type: item.type,
      };
    })
    .filter((item) => item.odds && item.goalLine);

  JCGoalLineList.map((JCGoalLineItem) => {
    const 
  });

  
  return [...JCSinList];
}
