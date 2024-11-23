import { existsSync, readFileSync, writeFileSync } from 'fs';
import { ChuanInfo, ChuanRule } from '../type/index';
import { toNumber, uniqBy } from './index';
import path from 'path';

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
