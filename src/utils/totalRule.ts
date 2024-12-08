import { existsSync, readFileSync, writeFileSync } from 'fs';
import {
  GoalInfo,
  TotalRule,
} from '../type/index.ts';
import { uniqBy,  toNumber } from './index.ts';
import path from 'path';

let GlobalTotalRuleList: TotalRule[] = [];
const FILE_PATH = path.resolve(import.meta.dirname || './', '../../rule/totalRule.csv');
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

export const updateTotalRuleList = (sinDataList: GoalInfo[]) => {
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
      hgGoalLine2: item.data.HGgoalLine1,
      hgResult2: item.data.HGTouz2,
    };
  });
  const oldGoalLineRuleList = getTotalRuleList();

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

export const getTotalRuleList = () => {
  if (GlobalTotalRuleList?.length) return GlobalTotalRuleList;
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
      }, {} as TotalRule);
    });
  GlobalTotalRuleList = ruleList;
  return GlobalTotalRuleList;
};
