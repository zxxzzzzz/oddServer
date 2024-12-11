import { existsSync, readFileSync, writeFileSync } from 'fs';
import { TeamRule } from '../type/index.ts';
import { getStrSameWeight, maxBy, toNumber, uniqBy, zipBy } from './lodash.ts';
import path from 'path';

const FILE_PATH = path.resolve(import.meta.dirname || './', '../../rule/teamRule.csv');
const CSV_HEAD = ['jcLeague', 'jcTeam', 'hgLeague', 'hgTeam', 'weight'] as const;

export const updateTeamRuleList = (ruleList: TeamRule[], op = { disableCache: false }) => {
  const newRuleList: TeamRule[] = ruleList;
  const oldRuleList = getTeamRuleList(op);
  const itemList = zipBy([...newRuleList, ...oldRuleList], (item) => item.jcLeague + ',' + item.jcTeam)
    .map(({ value }) => {
      return maxBy(value, (item) => item.weight);
    })
    .filter((v) => !!v);
  const uniqItemList = uniqBy(itemList, (item) => item.jcLeague + ',' + item.jcTeam).toSorted((v1, v2) => {
    const w1 = toNumber(v1.weight);
    const w2 = toNumber(v2.weight);
    return (w1 - w2) * 1000 + v1.jcLeague.localeCompare(v2.jcLeague) * 100 + v1.jcTeam.localeCompare(v2.jcTeam);
  });
  writeFileSync(
    FILE_PATH,
    CSV_HEAD.map((key) => {
      if (key === 'jcLeague') return '竞彩联赛';
      if (key === 'hgLeague') return '皇冠联赛';
      if (key === 'jcTeam') return '竞彩队伍';
      if (key === 'hgTeam') return '皇冠队伍';
      if (key === 'weight') return '相似度';
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

const getTeamRuleList = (() => {
  let readFromCsvTimestamp = 0;
  let cachedTeamRule: TeamRule[] = [];
  return (op = { disableCache: false }) => {
    if (cachedTeamRule?.length && !op.disableCache && new Date().valueOf() - readFromCsvTimestamp <= 1000 * 10) return cachedTeamRule;
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
          if (key === 'weight')
            return {
              ...re,
              weight: toNumber(v),
            };
          return { ...re, [key]: v };
        }, {} as TeamRule);
      });
    cachedTeamRule = ruleList;
    readFromCsvTimestamp = new Date().valueOf();
    return cachedTeamRule;
  };
})();

/**获取队伍相似度权重 */
export const getTeamSameWeight = (teamName1: string, teamName2: string) => {
  const teamRuleList = getTeamRuleList();
  const filteredRuleList = teamRuleList.filter((r) => r.jcTeam === teamName1 || r.jcTeam === teamName2);
  if (!filteredRuleList.length) return getStrSameWeight(teamName1, teamName2);
  const matchedRule = filteredRuleList.find((r) => {
    return (r.jcTeam === teamName1 && r.hgTeam === teamName2) || (r.jcTeam === teamName2 && r.hgTeam === teamName1);
  });
  if (matchedRule) return toNumber(matchedRule.weight);
  return 0;
};
