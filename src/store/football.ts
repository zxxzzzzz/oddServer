import { getHGLeagueListAllByToken, getHGGameListByTokenAndLeagueId, getJCInfoList, getHGGameMore } from '../api/football';
import { getToken } from './hgAccount';
import { GlobalOptions, HGHhad, HGHhafu, HGInfo, JCInfo, SinInfo } from '../type/index';
import {
  errorLog,
  getLeagueSameWeight,
  getRatioAvg,
  getMatchSinData,
  getTeamSameWeight,
  maxBy,
  strFixed,
  toAsyncTimeFunction,
  uniqBy,
  warnLog,
  getChuanInfo,
  getChuanRuleList,
} from '../utils/index';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { delay } from '../api/utils';
import stringify from 'json-stringify-pretty-compact';
import { resolve } from 'path';
import dayjs from 'dayjs';
import { cuFetch } from '../api/request';

const ZERO_TIME = '2000-11-08T05:55:26.881Z';

// 联赛数据
export const GlobalFootballState: {
  /**给http接口用的竞猜数据 */
  JCInfoList: JCInfo[];
  /**给http接口用的HG数据 */
  HGInfoList: HGInfo[];
  /**需要更新的HGInfo数据 */
  waitUpdateHGInfoList: {
    HGEcid: string;
    HGLeagueId: string;
    JCMatchId: string;
    teamWeight: number;
    /** 该条数据对应的hg info是否正在更新 */
    updateState: 'doing' | 'done' | 'todo';
    /** 该条数据添加到数组的时间*/
    addedTime: string;
  }[];
  /**HG所有足球联赛数据 */
  HGLeagueList: { name: string; leagueId: string }[];
  /**HG所有联赛下的比赛数据 */
  HGGameInfoList: {
    HGLeagueId: string;
    JCLeagueName: string;
    gameList: {
      ecid: string;
      homeTeam: string;
      awayTeam: string;
      more: string;
    }[];
    // 联赛的更新时间
    updateTime: string;
  }[];
  /**HG联赛更新时间 */
  HGLeagueListUpdateTime: string;
  /**JC Info更新时间 */
  JCInfoListUpdateTime: string;
} = {
  JCInfoList: [],
  HGInfoList: [],
  waitUpdateHGInfoList: [],
  HGLeagueList: [],
  HGGameInfoList: [],
  HGLeagueListUpdateTime: ZERO_TIME,
  JCInfoListUpdateTime: ZERO_TIME,
};

/** 更新jcInfo数据 */
const updateJCInfoList = async () => {
  if (new Date().valueOf() - new Date(GlobalFootballState.JCInfoListUpdateTime).valueOf() > 1000 * 10) {
    GlobalFootballState.JCInfoListUpdateTime = new Date().toISOString();
    try {
      const JCInfoList = await getJCInfoList();
      GlobalFootballState.JCInfoListUpdateTime = new Date().toISOString();
      GlobalFootballState.JCInfoList = JCInfoList.map((JCInfo) => {
        return {
          ...JCInfo,
          createdAt: GlobalFootballState.JCInfoList.find((item) => item.matchId === JCInfo.matchId)?.createdAt || new Date().toISOString(),
        };
      });
    } catch (error) {
      errorLog((error as Error).message);
      GlobalFootballState.JCInfoListUpdateTime = ZERO_TIME;
    }
  }
  return GlobalFootballState.JCInfoList;
};

/**更新hg所有联赛数据
 * @param maxAge 过期时间,功能类似http协议里的maxAge
 *
 * */
const updateAllHGLeagueList = async (op: { maxAge: number } = { maxAge: 1000 * 60 * 10 }) => {
  if (!GlobalFootballState.JCInfoList?.length) return [];
  // HG联赛数据过期超过10分钟，就更新联赛数据
  const nowTimestamp = new Date().valueOf();
  if (nowTimestamp - new Date(GlobalFootballState.HGLeagueListUpdateTime).valueOf() > op.maxAge) {
    GlobalFootballState.HGLeagueListUpdateTime = new Date(nowTimestamp).toISOString();
    const token = await getToken();
    try {
      const HGleagueItemList = await getHGLeagueListAllByToken(token.url, token.uid, token.ver);
      GlobalFootballState.HGLeagueListUpdateTime = new Date().toISOString();
      GlobalFootballState.HGLeagueList = HGleagueItemList;
    } catch (error) {
      errorLog((error as Error).message);
      GlobalFootballState.HGLeagueListUpdateTime = ZERO_TIME;
    }
  }
};

/**根据JC上的联赛数据更新HGGameInfoList联赛数据
 * @param limitLeagueCount 一次更新多少联赛
 * @param maxAge 联赛过期时间
 *
 */
const updateHGGameInfoList = async (op: { limitLeagueCount: number; maxAge: number } = { limitLeagueCount: 5, maxAge: 1000 * 60 * 10 }) => {
  if (!GlobalFootballState.JCInfoList?.length) return [];
  if (!GlobalFootballState.HGLeagueList?.length) return [];
  /**来自jc的联赛数据 */
  const leagueListFromJC = GlobalFootballState.JCInfoList.map((JCInfo) => {
    const fullSameHgLeagueList = GlobalFootballState.HGLeagueList.filter((HGLeagueItem) => {
      return getLeagueSameWeight(HGLeagueItem.name, JCInfo.leagueAllName) === 1;
    });
    const HGLeague = maxBy(GlobalFootballState.HGLeagueList, (HGLeagueItem) =>
      getLeagueSameWeight(HGLeagueItem.name, JCInfo.leagueAllName)
    )!;
    return [...fullSameHgLeagueList, HGLeague].map((hgItem) => {
      return {
        JCLeagueName: JCInfo.leagueAllName,
        HGLeagueName: hgItem?.name || '',
        HGLeagueId: hgItem?.leagueId || '',
        weight: getLeagueSameWeight(JCInfo.leagueAllName, hgItem?.name || ''),
      };
    });
  }).flat();
  /** 所有需要更新的 HG league*/
  const uniqHGLeagueList = uniqBy(leagueListFromJC, (item) => item.HGLeagueId).filter((leagueItem) => {
    const finedHGGameInfo = GlobalFootballState.HGGameInfoList.find((item) => item.HGLeagueId === leagueItem.HGLeagueId);
    if (!finedHGGameInfo) return true;
    // hgGameInfo 过期
    if (finedHGGameInfo && new Date().valueOf() - new Date(finedHGGameInfo.updateTime).valueOf() > op.maxAge) return true;
    return false;
  });
  // 更新联赛里的gameList
  for (const waitLeagueItem of uniqHGLeagueList.slice(0, op.limitLeagueCount)) {
    if (!GlobalFootballState.HGGameInfoList.some((item) => item.HGLeagueId === waitLeagueItem.HGLeagueId)) {
      GlobalFootballState.HGGameInfoList = [
        ...GlobalFootballState.HGGameInfoList,
        { HGLeagueId: waitLeagueItem.HGLeagueId, updateTime: ZERO_TIME, gameList: [], JCLeagueName: waitLeagueItem.JCLeagueName },
      ];
    }
    GlobalFootballState.HGGameInfoList = GlobalFootballState.HGGameInfoList.map((HGGame) => {
      if (HGGame.HGLeagueId === waitLeagueItem.HGLeagueId) return { ...HGGame, updateTime: new Date().toISOString() };
      return {
        ...HGGame,
      };
    });
    const token = await getToken();
    try {
      // 获取HG gameList
      const HGGameList = await getHGGameListByTokenAndLeagueId(token.url, token.ver, token.uid, waitLeagueItem.HGLeagueId);
      GlobalFootballState.HGGameInfoList = GlobalFootballState.HGGameInfoList.map((HGGame) => {
        if (HGGame.HGLeagueId === waitLeagueItem.HGLeagueId) return { ...HGGame, updateTime: new Date().toISOString() };
        return {
          ...HGGame,
        };
      });
      // 更新 HGGameList
      GlobalFootballState.HGGameInfoList = GlobalFootballState.HGGameInfoList.filter((gameInfo) =>
        //  去除HGGameInfoList中不存在于JC的league
        GlobalFootballState.JCInfoList.some((JCInfo) => JCInfo.leagueAllName === gameInfo.JCLeagueName)
      )
        .map((info) => {
          // 更新 hg gameInfo
          if (info.HGLeagueId === waitLeagueItem.HGLeagueId) {
            return {
              gameList: (HGGameList?.serverresponse?.ec || [])
                .map((item) => {
                  return {
                    ecid: item?.game?.ECID?._text || '',
                    homeTeam: item?.game?.TEAM_H?._text || '',
                    awayTeam: item?.game?.TEAM_C?._text || '',
                    more: item?.game?.MORE?._text || '',
                  };
                })
                .filter((d) => d.ecid),
              updateTime: new Date().toISOString(),
              HGLeagueId: waitLeagueItem.HGLeagueId,
              JCLeagueName: waitLeagueItem.JCLeagueName,
              HGLeagueName: waitLeagueItem.HGLeagueName,
            };
          }
          return info;
        })
        // 按照 更新时间先后排序。保证后续更新，先更新 时间较早的数据
        .toSorted((v1, v2) => new Date(v1.updateTime).valueOf() - new Date(v2.updateTime).valueOf());
    } catch (error) {
      errorLog((error as Error).message);
      GlobalFootballState.HGGameInfoList = GlobalFootballState.HGGameInfoList.map((HGGame) => {
        if (HGGame.HGLeagueId === waitLeagueItem.HGLeagueId) return { ...HGGame, updateTime: ZERO_TIME };
        return {
          ...HGGame,
        };
      });
    }
  }
};

/**根据jc数据和 hgGameList数据 更新waitUpdateHGInfoList。单纯数据比较
 * @param maxAge HGInfo过期时间
 */
const updateWaitHGInfoList = (op: { maxAge: number } = { maxAge: 1000 * 10 }) => {
  if (!GlobalFootballState.JCInfoList?.length) return [];
  if (!GlobalFootballState.HGGameInfoList?.length) return [];

  for (const JCInfo of GlobalFootballState.JCInfoList) {
    const HGGameList = GlobalFootballState.HGGameInfoList.filter((item) => item.JCLeagueName === JCInfo.leagueAllName)
      .map((item) => {
        return item.gameList.map((g) => {
          return { ...g, HGLeagueId: item.HGLeagueId };
        });
      })
      .flat();
    if (!HGGameList?.length) continue;
    const toUpdateHGMatchList = HGGameList.filter((item) => item.more && item.more !== '0').map((hgGame) => {
      const HGHomeTeam = hgGame.homeTeam || '';
      const HGAwayTeam = hgGame.awayTeam || '';
      const awayTeamWeight = getTeamSameWeight(HGAwayTeam, JCInfo.awayTeamAllName);
      const homeTeamWeight = getTeamSameWeight(HGHomeTeam, JCInfo.homeTeamAllName);
      return {
        HGEcid: hgGame.ecid,
        JCMatchId: JCInfo.matchId,
        teamWeight: awayTeamWeight + homeTeamWeight,
        HGLeagueId: hgGame.HGLeagueId,
        addedTime: new Date().toISOString(),
        updateState: 'todo' as const,
      };
    });
    /**与当前jcInfo最匹配的hg比赛 */
    const maxSameMatchItem = maxBy(toUpdateHGMatchList, (item) => item.teamWeight);
    if (!maxSameMatchItem) continue;
    const waitHgInfo = GlobalFootballState.waitUpdateHGInfoList.find((waitItem) => waitItem.JCMatchId === maxSameMatchItem.JCMatchId);
    const finedHGInfo = GlobalFootballState.HGInfoList.find((info) => maxSameMatchItem.JCMatchId === info.matchId);
    const isHgInfoExpired = new Date().valueOf() - new Date(finedHGInfo?.updatedAt || 0).valueOf() > op.maxAge;
    if (!isHgInfoExpired) continue;
    if (waitHgInfo && waitHgInfo.updateState === 'done') continue;
    // 获取 HGGame里的gameList
    // 删除已经做完的任务
    // 排序为了 先添加的数据先更新
    GlobalFootballState.waitUpdateHGInfoList = uniqBy(
      [maxSameMatchItem, ...GlobalFootballState.waitUpdateHGInfoList],
      (item) => item.JCMatchId
    )
      .filter((item) => {
        // 待更新节点 等待太久还没更新，需要删除(可能这个数据已经不需要再更新了)
        const isWaitHgInfoExpired = new Date().valueOf() - new Date(item.addedTime).valueOf() > 1000 * 60 * 1;
        // 已经更新完的wait节点要删除
        if (item.updateState === 'done') return false;
        if (item.updateState === 'doing' && isWaitHgInfoExpired) return false;
        // 删除 还没更新 但是 已经过期的节点
        if (item.updateState === 'todo' && isWaitHgInfoExpired) return false;
        return true;
      })
      .toSorted((v1, v2) => new Date(v1.addedTime).valueOf() - new Date(v2.addedTime).valueOf());
  }
};

/**
 *
 * @param op limitMatchCount 最多可以获取几场比赛
 * @returns
 */
const updateHGInfoList = async (op: { limitMatchCount: number }) => {
  if (!GlobalFootballState.JCInfoList?.length) return [];
  const waitMatchList = GlobalFootballState.waitUpdateHGInfoList.filter((v) => v.updateState === 'todo').slice(0, op.limitMatchCount);
  if (!waitMatchList?.length) return [];
  GlobalFootballState.waitUpdateHGInfoList = GlobalFootballState.waitUpdateHGInfoList.map((stateItem) => {
    if (waitMatchList.some((waitItem) => waitItem.JCMatchId === stateItem.JCMatchId)) {
      return {
        ...stateItem,
        updateState: 'doing',
      };
    }
    return { ...stateItem };
  });
  const token = await getToken();
  for (const waitHGMatch of waitMatchList) {
    try {
      const finedStateItem = GlobalFootballState.waitUpdateHGInfoList.find((stateItem) => stateItem.JCMatchId === waitHGMatch.JCMatchId);
      if (finedStateItem) {
        // 更新的时候重置 时间戳，保证这个更新请求起码占用1min的独自时间。其他不会再去更新这个hgInfo
        finedStateItem.addedTime = new Date().toISOString();
      }
      const gameMore = await getHGGameMore({
        ...token,
        ecid: waitHGMatch.HGEcid,
        lid: waitHGMatch.HGLeagueId ?? '',
      });
      if (!gameMore.serverresponse.game) {
        warnLog('getMore无数据 ecid:' + waitHGMatch.HGEcid);
        waitHGMatch.updateState = 'done';
        continue;
      }
      const normalPtypeGameMore = (gameMore?.serverresponse?.game ?? []).filter((item) => !item?.ptype?._text);

      const toUpdateHGInfo = {
        matchId: waitHGMatch.JCMatchId,
        leagueAbbName: normalPtypeGameMore?.[0]?.league?._text || '',
        leagueAllName: normalPtypeGameMore?.[0]?.league?._text || '',
        leagueCode: '',
        matchNumStr: '',
        matchDate: '',
        matchTime: '',
        matchTimeFormat: normalPtypeGameMore?.[0]?.datetime?._text || '',
        homeTeamAbbName: normalPtypeGameMore?.[0]?.team_h?._text || '',
        homeTeamAllName: normalPtypeGameMore?.[0]?.team_h?._text || '',
        awayTeamAbbName: normalPtypeGameMore?.[0]?.team_c?._text || '',
        awayTeamAllName: normalPtypeGameMore?.[0]?.team_c?._text || '',
        // 负
        had_a: strFixed(normalPtypeGameMore.find((item) => (item?.sw_M?._text ?? '').toUpperCase() === 'Y')?.ior_MC?._text || ''),
        // 胜
        had_h: strFixed(normalPtypeGameMore.find((item) => (item?.sw_M?._text ?? '').toUpperCase() === 'Y')?.ior_MH?._text || ''),
        // 平
        had_d: strFixed(normalPtypeGameMore.find((item) => (item?.sw_M?._text ?? '').toUpperCase() === 'Y')?.ior_MN?._text || ''),
        ...[0, 1, 2, 3, 4, 5].reduce((re, curIndex) => {
          const isHStrong = (normalPtypeGameMore?.[curIndex]?.strong?._text ?? '').toUpperCase() === 'H';
          const hhad_a = strFixed(normalPtypeGameMore[curIndex]?.ior_PRC?._text || '');
          const hhad_h = strFixed(normalPtypeGameMore[curIndex]?.ior_PRH?._text || '');
          return {
            ...re,
            [`hhad_a${curIndex + 1}`]: hhad_a,
            [`hhad_h${curIndex + 1}`]: hhad_h,
            [`hhad_d${curIndex + 1}`]: '-',
            [`hhad_goalLine${curIndex + 1}`]: !hhad_a
              ? '-'
              : getRatioAvg(normalPtypeGameMore[curIndex]?.ratio?._text || '', isHStrong ? true : false),
          };
        }, {} as HGHhad),
        wm_h1: strFixed(normalPtypeGameMore.find((item) => (item?.sw_WM?._text ?? '').toUpperCase() === 'Y')?.ior_WMH1?._text ?? ''),
        wm_h2: strFixed(normalPtypeGameMore.find((item) => (item?.sw_WM?._text ?? '').toUpperCase() === 'Y')?.ior_WMH2?._text ?? ''),
        wm_h3: strFixed(normalPtypeGameMore.find((item) => (item?.sw_WM?._text ?? '').toUpperCase() === 'Y')?.ior_WMH3?._text ?? ''),
        wm_hov: strFixed(normalPtypeGameMore.find((item) => (item?.sw_WM?._text ?? '').toUpperCase() === 'Y')?.ior_WMHOV?._text ?? ''),
        wm_a1: strFixed(normalPtypeGameMore.find((item) => (item?.sw_WM?._text ?? '').toUpperCase() === 'Y')?.ior_WMC1?._text ?? ''),
        wm_a2: strFixed(normalPtypeGameMore.find((item) => (item?.sw_WM?._text ?? '').toUpperCase() === 'Y')?.ior_WMC2?._text ?? ''),
        wm_a3: strFixed(normalPtypeGameMore.find((item) => (item?.sw_WM?._text ?? '').toUpperCase() === 'Y')?.ior_WMC3?._text ?? ''),
        wm_aov: strFixed(normalPtypeGameMore.find((item) => (item?.sw_WM?._text ?? '').toUpperCase() === 'Y')?.ior_WMCOV?._text ?? ''),
        wm_0: strFixed(normalPtypeGameMore.find((item) => (item?.sw_WM?._text ?? '').toUpperCase() === 'Y')?.ior_WM0?._text ?? ''),
        wm_n: strFixed(normalPtypeGameMore.find((item) => (item?.sw_WM?._text ?? '').toUpperCase() === 'Y')?.ior_WMN?._text ?? ''),
        ...[0, 1, 2, 3].reduce((re, curIndex) => {
          const isHStrong = (normalPtypeGameMore?.[curIndex]?.strong?._text ?? '').toUpperCase() === 'H';
          const hhafu_h = normalPtypeGameMore[curIndex]?.ior_HPRH?._text || '';
          const hhafu_a = normalPtypeGameMore[curIndex]?.ior_HPRC?._text || '';
          return {
            ...re,
            [`hhafu_goalLine${curIndex + 1}`]: !hhafu_h
              ? '-'
              : getRatioAvg(normalPtypeGameMore[curIndex]?.hratio?._text || '', isHStrong ? true : false),
            [`hhafu_h${curIndex + 1}`]: strFixed(hhafu_h),
            [`hhafu_a${curIndex + 1}`]: strFixed(hhafu_a),
          };
        }, {} as HGHhafu),
        updateTime: new Date().toISOString(),
        createdAt:
          GlobalFootballState.HGInfoList.find((info) => info.matchId === waitHGMatch.JCMatchId)?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      GlobalFootballState.HGInfoList = uniqBy([toUpdateHGInfo, ...GlobalFootballState.HGInfoList], (item) => item.matchId).filter(
        (HGInfo) =>
          // 去除HG中不存在于JC的match
          GlobalFootballState.JCInfoList.some((JCInfo) => JCInfo.matchId === HGInfo.matchId)
      );
      const finedItem = GlobalFootballState.waitUpdateHGInfoList.find((waitStateItem) => waitStateItem.JCMatchId === waitHGMatch.JCMatchId);
      if (finedItem) {
        finedItem.updateState = 'done';
      }
      // 删除toUpdateHGInfoList里已经更新完毕的数据
    } catch (error) {
      errorLog((error as Error).message);
      // 更新失败 重置回需要更新的状态
      const finedItem = GlobalFootballState.waitUpdateHGInfoList.find((waitItem) => waitItem.JCMatchId === waitHGMatch.JCMatchId);
      if (finedItem) {
        finedItem.updateState = 'done';
      }
    }
  }
};

export function getSinInfoList(JCInfoList: JCInfo[], HGInfoList: HGInfo[], op: GlobalOptions) {
  const sinInfoList = (JCInfoList || [])
    .filter((jcInfo) => jcInfo.matchId)
    .map((jcInfo) => {
      const hgInfo = (HGInfoList || []).filter((jcInfo) => jcInfo.matchId).find((hg) => hg.matchId === jcInfo.matchId);
      if (hgInfo) {
        return getMatchSinData(jcInfo, hgInfo, op);
      }
      return void 0;
    })
    .filter((v): v is SinInfo[] => !!v)
    .flat();
  return sinInfoList;
}

export function getChuanInfoList(sinInfoList: SinInfo[], op: GlobalOptions) {
  const chuanRuleList = getChuanRuleList();
  const filteredSinInfoList = sinInfoList
    .filter((v) => v.data.profit >= 450 && v.data.JCTouz2 === '-' && v.data.matchTimeFormat)
    .filter((v) => {
      return chuanRuleList.some((rule) => {
        return (
          v.data.JCgoalLine1 === rule.jcGoalLine &&
          v.data.JCTouz1 === rule.jcResult &&
          v.data.HGgoalLine1 === rule.hgGoalLine1 &&
          v.data.HGgoalLine2 === rule.hgGoalLine2 &&
          v.data.HGTouz1 === rule.hgResult1 &&
          v.data.HGTouz2 === rule.hgResult2
        );
      });
    })
    .toSorted((v1, v2) => {
      return (
        dayjs(v1.data.matchTimeFormat, 'YYYY-MM-DD HH:mm:ss').valueOf() - dayjs(v2.data.matchTimeFormat, 'YYYY-MM-DD HH:mm:ss').valueOf()
      );
    });
  return filteredSinInfoList
    .map((info1, index) => {
      const exInfoList = filteredSinInfoList
        .slice(index)
        .filter(
          (info2) =>
            info2.matchId !== info1.matchId &&
            dayjs(info2.data.matchTimeFormat, 'YYYY-MM-DD HH:mm:ss').valueOf() -
              dayjs(info1.data.matchTimeFormat, 'YYYY-MM-DD HH:mm:ss').valueOf() >
              1000 * 60 * 60 * 2
        );
      return exInfoList.map((exInfo) => {
        return getChuanInfo(info1, exInfo, { ...op, JCPointSin: op.JCPointChuan });
      });
    })
    .flat();
}

/**更新足球数据到web */
export const saveFootballState = function () {
  const filePath = resolve(__dirname, '../../cache/footballState.json');
  writeFileSync(filePath, stringify(GlobalFootballState), { encoding: 'utf-8' });
};
export const loadFootballState = function () {
  const filePath = resolve(__dirname, '../../cache/footballState.json');
  if (!existsSync(filePath)) return;
  const content = readFileSync(filePath, { encoding: 'utf-8' });
  Object.entries(JSON.parse(content)).forEach(([key, value]) => {
    GlobalFootballState[key as keyof typeof GlobalFootballState] = value as any;
  });
};


/**从web获取足球数据 */
export async function updateFootballStateFromWeb() {
  await updateJCInfoList();
  await updateAllHGLeagueList();
  await updateHGGameInfoList({ limitLeagueCount: 5, maxAge: 1000 * 60 * 10 });
  updateWaitHGInfoList({ maxAge: 1000 * 10 });
  await updateHGInfoList({ limitMatchCount: 5 });
}
