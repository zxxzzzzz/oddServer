import { getHGLeagueListAll, getHGGameList, getJCInfoList, getHGGameMore } from '../api/football.ts';
import { PointOptions, HGHhad, HGHhafu, HGHilo, HGInfo, JCInfo, SinInfo, GoalInfo } from '../type/index.ts';
import {
  getLeagueSameWeight,
  getRatioAvg,
  getMatchSinData,
  maxBy,
  strFixed,
  uniqBy,
  warnLog,
  getChuanInfoBySinInfo,
  getChuanRuleList,
  toAsyncTimeFunction,
  swapFields,
} from '../utils/index.ts';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import stringify from 'json-stringify-pretty-compact';
import { resolve } from 'path';
import dayjs from 'dayjs';
import { getTeamSameWeight, updateTeamRuleList } from '../utils/teamRule.ts';
import { getMatchGoalInfo } from "../utils/goalRule.ts";

const ZERO_TIME = '2000-11-08T05:55:26.881Z';
const STATE_FILE_PATH = resolve(import.meta.dirname || './', '../../persistentState/footballState.json');

// 联赛数据
export const GlobalFootballState: {
  /**给http接口用的竞猜数据 */
  JCInfoList: JCInfo[];
  /**给http接口用的HG数据 */
  HGInfoList: HGInfo[];
  /**HG所有足球联赛数据 */
  HGLeagueList: { name: string; leagueId: string }[];
  /**HG所有联赛下的比赛数据 */
  HGGameList: {
    JCLeagueName: string;
    HGLeagueName: string;
    HGLeagueId: string;
    ecid: string;
    homeTeam: string;
    awayTeam: string;
    more: string;
    // 比赛的更新时间
    updateTime: string;
  }[];
  /**通过jc数据过滤后的HG比赛数据 */
  filteredHGGameList: {
    JCLeagueName: string;
    HGLeagueId: string;
    ecid: string;
    homeTeam: string;
    awayTeam: string;
    more: string;
    // 比赛的更新时间
    updateTime: string;
    jcMatchId: string;
    teamWeight: number;
  }[];
  /**HG联赛更新时间 */
  HGLeagueListUpdateTime: string;
  /**JC Info更新时间 */
  JCInfoListUpdateTime: string;
} = {
  JCInfoList: [],
  HGInfoList: [],
  HGLeagueList: [],
  HGGameList: [],
  filteredHGGameList: [],
  HGLeagueListUpdateTime: ZERO_TIME,
  JCInfoListUpdateTime: ZERO_TIME,
};

/** 更新jcInfo数据 */
export const updateJCInfoList = async () => {
  const data = await getJCInfoList();
  if (!data) return;
  const matchInfoList = data?.value?.matchInfoList as any[];
  const jcInfoList = (matchInfoList ?? [])
    .map((info: any) => info.subMatchList)
    .flat()
    .map((match: any) => {
      return {
        matchId: `${match?.matchId}`,
        leagueAbbName: match?.leagueAbbName ?? '',
        leagueAllName: match?.leagueAllName ?? '',
        leagueCode: match?.leagueCode ?? '',
        matchNumStr: match?.matchNumStr ?? '',
        matchDate: match?.matchDate ?? '',
        matchTime: match?.matchTime ?? '',
        matchTimeFormat: `${match?.matchDate} ${match?.matchTime}`,
        homeTeamAbbName: match?.homeTeamAbbName ?? '',
        homeTeamAllName: match?.homeTeamAllName ?? '',
        awayTeamAbbName: match?.awayTeamAbbName ?? '',
        awayTeamAllName: match?.awayTeamAllName ?? '',
        isSingle_had: (match?.poolList || []).find((pool: any) => pool.poolCode === 'HAD')?.single?.toString?.() ?? '',
        isSingle_hhad: (match?.poolList || []).find((pool: any) => pool.poolCode === 'HHAD')?.single?.toString?.() ?? '',
        had_a: match?.had?.a ?? '',
        had_h: match?.had?.h ?? '',
        had_d: match?.had?.d ?? '',
        hhad_a: match?.hhad?.a ?? '',
        hhad_h: match?.hhad?.h ?? '',
        hhad_d: match?.hhad?.d ?? '',
        hhad_goalLine: match?.hhad?.goalLine ?? '',
        hafu_aa: match?.hafu?.aa ?? '',
        hafu_ad: match?.hafu?.ad ?? '',
        hafu_ah: match?.hafu?.ah ?? '',
        hafu_da: match?.hafu?.da ?? '',
        hafu_dd: match?.hafu?.dd ?? '',
        hafu_dh: match?.hafu?.dh ?? '',
        hafu_ha: match?.hafu?.ha ?? '',
        hafu_hd: match?.hafu?.hd ?? '',
        hafu_hh: match?.hafu?.hh ?? '',

        isSingle_ttg: (match?.poolList || []).find((pool: any) => pool.poolCode === 'TTG')?.single?.toString?.() ?? '',
        ttg_s0: match?.ttg?.s0,
        ttg_s1: match?.ttg?.s1,
        ttg_s2: match?.ttg?.s2,
        ttg_s3: match?.ttg?.s3,
        ttg_s4: match?.ttg?.s4,
        ttg_s5: match?.ttg?.s5,
        ttg_s6: match?.ttg?.s6,
        ttg_s7: match?.ttg?.s0,

        updateTime: new Date().toISOString(),
        createdAt: match?.createdAt ?? '',
        updatedAt: new Date().toISOString(),
      };
    });
  GlobalFootballState.JCInfoListUpdateTime = new Date().toISOString();
  GlobalFootballState.JCInfoList = jcInfoList.map((JCInfo) => {
    return {
      ...JCInfo,
      createdAt: GlobalFootballState.JCInfoList.find((item) => item.matchId === JCInfo.matchId)?.createdAt || new Date().toISOString(),
    };
  });
};

/**
 * 更新hg所有联赛数据
 * @param maxAge 过期时间,功能类似http协议里的maxAge
 *
 * */
export const updateAllHGLeagueList = async () => {
  if (!GlobalFootballState.JCInfoList?.length) return [];
  const hgLeagueItemList = await getHGLeagueListAll();
  if (!hgLeagueItemList) return;
  GlobalFootballState.HGLeagueListUpdateTime = new Date().toISOString();
  GlobalFootballState.HGLeagueList = hgLeagueItemList;
};

const getAllLeagueList = () => {
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
  return uniqBy(leagueListFromJC, (item) => item.HGLeagueId);
};

export const updateHGGameList = async () => {
  const leagueList = getAllLeagueList();
  if (!leagueList?.length) return;
  const promiseList = leagueList.map(async (item) => {
    const hgGameList = await getHGGameList({ lid: item.HGLeagueId });
    if (!hgGameList) {
      console.log('loss', { lid: item.HGLeagueId });
      return void 0;
    }
    const ecList = Array.isArray(hgGameList?.serverresponse?.ec || [])
      ? hgGameList?.serverresponse?.ec || []
      : ([hgGameList?.serverresponse?.ec] as unknown as typeof hgGameList.serverresponse.ec);
    return ecList
      .map((ecItem) => {
        return {
          ecid: ecItem?.game?.ECID?._text || '',
          homeTeam: ecItem?.game?.TEAM_H?._text || '',
          awayTeam: ecItem?.game?.TEAM_C?._text || '',
          more: ecItem?.game?.MORE?._text || '',
          updateTime: new Date().toISOString(),
          HGLeagueId: item.HGLeagueId,
          JCLeagueName: item.JCLeagueName,
          HGLeagueName: item.HGLeagueName,
        };
      })
      .filter((d) => d.ecid);
  });
  GlobalFootballState.HGGameList = (await Promise.all(promiseList)).filter((v) => !!v).flat();
  const toUpdateHgMatchList = GlobalFootballState.JCInfoList.map((jcInfo) => {
    const hgMatchList = GlobalFootballState.HGGameList.filter(
      (item) => item.JCLeagueName === jcInfo.leagueAllName && item.more && item.more !== '0'
    ).map((hgGame) => {
      const HGHomeTeam = hgGame.homeTeam || '';
      const HGAwayTeam = hgGame.awayTeam || '';
      const awayTeamWeight = getTeamSameWeight(HGAwayTeam, jcInfo.awayTeamAllName);
      const homeTeamWeight = getTeamSameWeight(HGHomeTeam, jcInfo.homeTeamAllName);
      updateTeamRuleList([
        {
          jcTeam: jcInfo.homeTeamAllName,
          hgTeam: HGHomeTeam,
          weight: homeTeamWeight,
          jcLeague: jcInfo.leagueAllName,
          hgLeague: hgGame.HGLeagueName,
        },
        {
          jcTeam: jcInfo.awayTeamAllName,
          hgTeam: HGAwayTeam,
          weight: awayTeamWeight,
          jcLeague: jcInfo.leagueAllName,
          hgLeague: hgGame.HGLeagueName,
        },
      ]);
      return {
        ...hgGame,
        jcMatchId: jcInfo.matchId,
        teamWeight: awayTeamWeight + homeTeamWeight,
      };
    });
    return maxBy(hgMatchList, (item) => item.teamWeight);
  })
    .filter((v) => !!v)
    .filter((v) => v.teamWeight > 0.4)
    .flat();
  GlobalFootballState.filteredHGGameList = toUpdateHgMatchList;
};

export const updateHgInfoList = toAsyncTimeFunction(
  async () => {
    if (!GlobalFootballState.JCInfoList?.length) return [];
    if (!GlobalFootballState.filteredHGGameList?.length) return [];

    const hgInfoPromiseList = GlobalFootballState.filteredHGGameList.map(async (match) => {
      const gameMore = await getHGGameMore({
        ecid: match.ecid,
        lid: match.HGLeagueId ?? '',
      });
      if (!gameMore?.serverresponse?.game) {
        warnLog('getMore无数据 ecid:' + match.HGLeagueId);
        return void 0;
      }
      const gameList = Array.isArray(gameMore?.serverresponse?.game ?? [])
        ? gameMore?.serverresponse?.game ?? []
        : ([gameMore?.serverresponse?.game] as unknown as typeof gameMore.serverresponse.game);
      const normalPtypeGameMore = gameList.filter((item) => !item?.ptype?._text);

      const jcHomeTeam = match.homeTeam;
      const jcAwayTeam = match.awayTeam;
      const hgHomeTeam = normalPtypeGameMore?.[0]?.team_h?._text || '';
      const hgAwayTeam = normalPtypeGameMore?.[0]?.team_c?._text || '';
      const homeWeight = getTeamSameWeight(jcHomeTeam, hgHomeTeam);
      const homeReverseWeight = getTeamSameWeight(jcHomeTeam, hgAwayTeam);
      const awayWeight = getTeamSameWeight(jcAwayTeam, hgAwayTeam);
      const awayReverseWeight = getTeamSameWeight(jcAwayTeam, hgHomeTeam);
      // 是否需要逆转 主队 客队
      const needReverseTeam = homeReverseWeight > homeWeight && awayReverseWeight > awayWeight;
      let hgInfo: HGInfo = {
        matchId: match.jcMatchId,
        isTeamReversed: needReverseTeam,
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
        ...[0, 1, 2, 3, 4].reduce((re, curIndex) => {
          const isHStrong = (normalPtypeGameMore?.[curIndex]?.strong?._text ?? '').toUpperCase() === 'H';
          const hilo_h = normalPtypeGameMore[curIndex]?.ior_POUC?._text || '';
          const hilo_a = normalPtypeGameMore[curIndex]?.ior_POUH?._text || '';
          return {
            ...re,
            [`hilo_goalLine${curIndex + 1}`]: !hilo_h
              ? '-'
              : getRatioAvg(normalPtypeGameMore[curIndex]?.ratio_o?._text || '', isHStrong ? false : true),
            [`hilo_h${curIndex + 1}`]: strFixed(hilo_h),
            [`hilo_a${curIndex + 1}`]: strFixed(hilo_a),
          };
        }, {} as HGHilo),
        updateTime: new Date().toISOString(),
        createdAt: GlobalFootballState.HGInfoList.find((info) => info.matchId === match.jcMatchId)?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      if (needReverseTeam) {
        hgInfo = swapFields(hgInfo, [
          { k1: 'homeTeamAbbName', k2: 'awayTeamAbbName' },
          { k1: 'homeTeamAllName', k2: 'awayTeamAllName' },
          { k1: 'had_a', k2: 'had_h' },
          { k1: 'had_a', k2: 'had_h' },
          { k1: `hhad_a1`, k2: `hhad_h1` },
          { k1: `hhad_a2`, k2: `hhad_h2` },
          { k1: `hhad_a3`, k2: `hhad_h3` },
          { k1: `hhad_a4`, k2: `hhad_h4` },
          { k1: `hhad_a5`, k2: `hhad_h5` },
          { k1: `hhad_a6`, k2: `hhad_h6` },
          { k1: `hhafu_a1`, k2: `hhafu_h1` },
          { k1: `hhafu_a2`, k2: `hhafu_h2` },
          { k1: `hhafu_a3`, k2: `hhafu_h3` },
          { k1: `hhafu_a4`, k2: `hhafu_h4` },
          { k1: `hilo_a1`, k2: `hilo_h1` },
          { k1: `hilo_a2`, k2: `hilo_h2` },
          { k1: `hilo_a3`, k2: `hilo_h3` },
          { k1: `hilo_a4`, k2: `hilo_h4` },
          { k1: `hilo_a5`, k2: `hilo_h5` },
        ]);
        hgInfo.hhad_goalLine1 = getRatioAvg(hgInfo.hhad_goalLine1, !hgInfo.hhad_goalLine1.startsWith('-'));
        hgInfo.hhad_goalLine2 = getRatioAvg(hgInfo.hhad_goalLine2, !hgInfo.hhad_goalLine2.startsWith('-'));
        hgInfo.hhad_goalLine3 = getRatioAvg(hgInfo.hhad_goalLine3, !hgInfo.hhad_goalLine3.startsWith('-'));
        hgInfo.hhad_goalLine4 = getRatioAvg(hgInfo.hhad_goalLine4, !hgInfo.hhad_goalLine4.startsWith('-'));
        hgInfo.hhad_goalLine5 = getRatioAvg(hgInfo.hhad_goalLine5, !hgInfo.hhad_goalLine5.startsWith('-'));
        hgInfo.hhad_goalLine6 = getRatioAvg(hgInfo.hhad_goalLine6, !hgInfo.hhad_goalLine6.startsWith('-'));

        hgInfo.hhafu_goalLine1 = getRatioAvg(hgInfo.hhafu_goalLine1, !hgInfo.hhafu_goalLine1.startsWith('-'));
        hgInfo.hhafu_goalLine2 = getRatioAvg(hgInfo.hhafu_goalLine2, !hgInfo.hhafu_goalLine2.startsWith('-'));
        hgInfo.hhafu_goalLine3 = getRatioAvg(hgInfo.hhafu_goalLine3, !hgInfo.hhafu_goalLine3.startsWith('-'));
        hgInfo.hhafu_goalLine4 = getRatioAvg(hgInfo.hhafu_goalLine4, !hgInfo.hhafu_goalLine4.startsWith('-'));

        hgInfo.hilo_goalLine1 = getRatioAvg(hgInfo.hilo_goalLine1, !hgInfo.hilo_goalLine1.startsWith('-'));
        hgInfo.hilo_goalLine2 = getRatioAvg(hgInfo.hilo_goalLine2, !hgInfo.hilo_goalLine2.startsWith('-'));
        hgInfo.hilo_goalLine3 = getRatioAvg(hgInfo.hilo_goalLine3, !hgInfo.hilo_goalLine3.startsWith('-'));
        hgInfo.hilo_goalLine4 = getRatioAvg(hgInfo.hilo_goalLine4, !hgInfo.hilo_goalLine4.startsWith('-'));
        hgInfo.hilo_goalLine5 = getRatioAvg(hgInfo.hilo_goalLine5, !hgInfo.hilo_goalLine5.startsWith('-'));
      }
      return hgInfo;
    });
    const hgInfoList = await Promise.all(hgInfoPromiseList);
    GlobalFootballState.HGInfoList = hgInfoList.filter((v) => !!v);
  },
  { tag: 'updateHgInfoList', desc: '', fileName: 'footballConsume' }
);

export function getSinInfoList(JCInfoList: JCInfo[], HGInfoList: HGInfo[], op: PointOptions) {
  const sinInfoList = (JCInfoList || [])
    .filter((jcInfo) => jcInfo.matchId)
    .map((jcInfo) => {
      const hgInfo = (HGInfoList || []).filter((info) => info.matchId).find((hg) => hg.matchId === jcInfo.matchId);
      if (hgInfo) {
        return getMatchSinData(jcInfo, hgInfo, op);
      }
      return void 0;
    })
    .filter((v): v is SinInfo[] => !!v)
    .flat();
  return sinInfoList;
}

export function getGoalInfoList(JCInfoList: JCInfo[], HGInfoList: HGInfo[], op: Omit<PointOptions, 'JCPointChuan'>) {
  const sinInfoList = (JCInfoList || [])
  .filter((jcInfo) => jcInfo.matchId)
  .map((jcInfo) => {
    const hgInfo = (HGInfoList || []).filter((info) => info.matchId).find((hg) => hg.matchId === jcInfo.matchId);
    if (hgInfo) {
      return getMatchGoalInfo(jcInfo, hgInfo, op);
    }
    return void 0;
  })
  .filter((v): v is GoalInfo[] => !!v)
  .flat();
return sinInfoList;
}

export function getChuanInfoList(sinInfoList: SinInfo[], op: PointOptions) {
  const chuanRuleList = getChuanRuleList();
  const filteredSinInfoList = sinInfoList
    .filter((v) => {
      return v.data.profit >= 300 && v.data.JCTouz2 === '-' && v.data.matchTimeFormat;
    })
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
      const exInfoList = filteredSinInfoList.slice(index).filter((info2) => {
        return (
          info2.matchId !== info1.matchId &&
          dayjs(info2.data.matchTimeFormat, 'YYYY-MM-DD HH:mm:ss').valueOf() -
            dayjs(info1.data.matchTimeFormat, 'YYYY-MM-DD HH:mm:ss').valueOf() >=
            1000 * 60 * 60 * 2
        );
      });
      return exInfoList.map((exInfo) => {
        return getChuanInfoBySinInfo(info1, exInfo, { ...op, JCPointSin: op.JCPointChuan });
      });
    })
    .flat();
}

/**更新足球数据到web */
export const saveFootballState = function () {
  const filePath = STATE_FILE_PATH;
  writeFileSync(filePath, stringify(GlobalFootballState), { encoding: 'utf-8' });
};
export const getFootballState = function (): typeof GlobalFootballState {
  const filePath = STATE_FILE_PATH;
  if (!existsSync(filePath)) return GlobalFootballState;
  const content = readFileSync(filePath, { encoding: 'utf-8' });
  return JSON.parse(content);
};
