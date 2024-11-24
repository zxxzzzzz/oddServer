import { existsSync, readFileSync, writeFileSync } from 'fs';
import { GoalLine, MethodRule, Result, SinInfo } from '../type/index';
import { toNumber, uniqBy } from './index';
import path from 'path';

let GlobalMethodRuleList: MethodRule[] = [];
const FILE_PATH = path.resolve(__dirname, '../../rule/methodRule.csv');
const CSV_HEAD = [
  'method',
  'jcGoalLine1',
  'jcResult1',
  'jcGoalLine2',
  'jcResult2',
  'hgGoalLine1',
  'hgResult1',
  'hgGoalLine2',
  'hgResult2',
] as const;

export const updateMethodRuleList = (sinDataList: SinInfo[]) => {
  const allMethod = sinDataList.map((item) => {
    return {
      method: item.data.method,
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
  const oldMethodRuleList = getMethodRuleList();

  const itemList = [...allMethod, ...oldMethodRuleList];
  const methodList = ['WL', 'WLD1', 'WLD2', 'LH1', 'LH2', 'LH3', 'WH1', 'WH2', 'WH3', 'D1', 'D2', 'D3'];
  const uniqItemList = uniqBy(itemList, (item) => CSV_HEAD.map((key) => item[key]).join(',')).toSorted((v1, v2) => {
    const v1Index = methodList.findIndex((m) => v1.method === m) * 10000 + toNumber(v1.jcGoalLine1) * 1000 + toNumber(v1.jcGoalLine2) * 100  + toNumber(v1.hgGoalLine1) * 10 + + toNumber(v1.hgGoalLine2) * 1 ;
    const v2Index = methodList.findIndex((m) => v2.method === m) * 10000 + toNumber(v2.jcGoalLine1) * 1000 + toNumber(v2.jcGoalLine2) * 100 + toNumber(v2.hgGoalLine1) * 10 + + toNumber(v2.hgGoalLine2) * 1;
    return v1Index - v2Index;
  });
  writeFileSync(
    FILE_PATH,
    CSV_HEAD.map((key) => {
      if (key === 'jcGoalLine1') return '竞彩让球线1';
      if (key === 'jcGoalLine2') return '竞彩让球线2';
      if (key === 'jcResult1') return '竞彩比赛结果1';
      if (key === 'jcResult2') return '竞彩比赛结果2';
      if (key === 'hgGoalLine1') return '皇冠让球线1';
      if (key === 'hgGoalLine2') return '皇冠让球线2';
      if (key === 'hgResult1') return '皇冠比赛结果1';
      if (key === 'hgResult2') return '皇冠比赛结果2';
      if (key === 'method') return '投注方式';
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

export const getMethodRuleList = () => {
  if (GlobalMethodRuleList?.length) return GlobalMethodRuleList;
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
      }, {} as MethodRule);
    });
  GlobalMethodRuleList = ruleList;
  return GlobalMethodRuleList;
};

export const getMethod = (item: {
  jcGoalLine1: GoalLine;
  jcResult1: Result;
  jcGoalLine2: GoalLine;
  jcResult2: Result;
  hgGoalLine1: GoalLine;
  hgResult1: Result;
  hgGoalLine2: GoalLine;
  hgResult2: Result;
}) => {
  const methodList = getMethodRuleList();
  const finedItem = methodList.find((m) => {
    return (
      m.jcGoalLine1 === item.jcGoalLine1 &&
      m.jcResult1 === item.jcResult1 &&
      m.jcGoalLine2 === item.jcGoalLine2 &&
      m.jcResult2 === item.jcResult2 &&
      m.hgGoalLine1 === item.hgGoalLine1 &&
      m.hgResult1 === item.hgResult1 &&
      m.hgGoalLine2 === item.hgGoalLine2 &&
      m.hgResult2 === item.hgResult2
    );
  });
  return finedItem?.method || 'WL';
};
