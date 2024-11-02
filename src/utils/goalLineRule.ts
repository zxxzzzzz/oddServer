import { readFileSync, writeFileSync } from 'fs';
import { GoalLineRule, SinInfo } from 'src/type/index.js';
import { uniqBy } from './index.js';

let GlobalGoalLineRuleList: GoalLineRule[] = [];

export const getGoalLineRuleList = () => {
  if (GlobalGoalLineRuleList?.length) return GlobalGoalLineRuleList;
  const ruleList = readFileSync('./cache/goalLineRule.csv', { encoding: 'utf-8' })
    .split('\r\n')
    .slice(1)
    .map((line: string) => {
      const [jcGoalLine1, jcResult1, jcGoalLine2, jcResult2, hgGoalLine1, hgResult1, hgGoalLine2, hgResult2] = line
        .split(',')
        .map((v) => {
          if (v === '胜平负') return '-';
          if (v === '独赢') return '-';
          if (v === '负') return 'a';
          if (v === '胜') return 'h';
          if (v === '平') return 'd';
          if (v === '净1') return 'J1';
          if (v === '净2') return 'J2';
          if (v === '净3') return 'J3';
          return v;
        });
      return {
        jcGoalLine1,
        jcResult1,
        jcGoalLine2,
        jcResult2,
        hgGoalLine1,
        hgResult1,
        hgGoalLine2,
        hgResult2,
      } as GoalLineRule;
    });
  GlobalGoalLineRuleList = ruleList;
  return ruleList;
};


export const updateGoalLineRuleList = (sinDataList: SinInfo[]) => {
  const allGoalLine = sinDataList
    .map((item) => {
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
    const oldGoalLineRuleList = getGoalLineRuleList()

    const itemList = [...allGoalLine, ...oldGoalLineRuleList];
    const keys = Object.keys(itemList[0]) as (keyof typeof itemList[0])[];
    const uniqItemList = uniqBy(itemList, item => keys.map((key) => item[key]).join(',')).sort((a,b) => {
      if(a.jcGoalLine1 === '-') return -1
      return parseFloat(a.jcGoalLine1) - parseFloat(b.jcGoalLine1) 
    });
 
  writeFileSync('./cache/goalLineRule.csv', keys.map((key)=>{
    if(key === 'jcGoalLine1') return '竞彩投注类型1'
    if(key === 'jcGoalLine2') return '竞彩投注类型2'
    if(key === 'jcResult1') return '竞彩比赛结果1'
    if(key === 'jcResult2') return '竞彩比赛结果2'
    if(key === 'hgGoalLine1') return '皇冠投注类型1'
    if(key === 'hgGoalLine2') return '皇冠投注类型2'
    if(key === 'hgResult1') return '皇冠比赛结果1'
    if(key === 'hgResult2') return '皇冠比赛结果2'
    return key
  }).join(',') + '\r\n', { encoding: 'utf-8' });
  writeFileSync(
    './cache/goalLineRule.csv',
    uniqItemList.map((item) => keys.map((key) => {
      const v = item[key]
      if(['jcGoalLine1'].includes(key)&&v === '-' && item.jcResult1!=='-') return '胜平负'
      if(['jcGoalLine2'].includes(key)&&v === '-' && item.jcResult2!=='-') return '胜平负'
      if(['hgGoalLine1'].includes(key)&&v === '-' && item.hgResult1!=='-') return '独赢'
      if(['hgGoalLine2'].includes(key)&&v === '-' && item.hgResult2!=='-') return '独赢'
      if(v === 'a') return '负'
      if(v === 'h') return '胜'
      if(v === 'd') return '平'
      if(v === 'J1') return '净1'
      if(v === 'J2') return '净2'
      if(v === 'J3') return '净3'
      return v
    }).join(',')).join('\r\n'),
    { flag: 'a', encoding: 'utf-8' }
  );
};