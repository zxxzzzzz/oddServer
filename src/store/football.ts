import {
  getHGLeagueListAllByToken,
  getHGGameListByTokenAndLeagueId,
  getJCInfoList,
  getHGGameMore,
} from '../api/football.js';
import { getToken } from './account.js';
import { HGHhad, HGHhafu, HGInfo, JCInfo } from '../type/index.js';
import { getLeagueSameWeight, getRatioAvg, getTeamSameWeight, maxBy, uniqBy } from '../utils/index.js';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { delay } from 'src/api/utils.js';

// 联赛数据
export const footballState: {
  /**给http接口用的竞猜数据 */
  JCInfoList: JCInfo[];
  /**给http接口用的HG数据 */
  HGInfoList: HGInfo[];
  /**HG所有足球联赛数据 */
  HGLeagueList: { name: string; leagueId: string }[];
  /**HG所有联赛下的比赛数据 */
  HGGameInfoList: {
    leagueId: string;
    JCLeagueName: string;
    gameList: {
      ecid: string;
      homeTeam: string;
      awayTeam: string;
      more: string;
    }[];
    updateTimestamp: number;
  }[];
  /**HG联赛更新时间 */
  HGLeagueListUpdateTimeStamp: number;
  /**JC Info更新时间 */
  JCInfoListUpdateTimeStamp: number;
} = {
  JCInfoList: [],
  HGInfoList: [],
  HGLeagueList: [],
  HGGameInfoList: [],
  HGLeagueListUpdateTimeStamp: 0,
  JCInfoListUpdateTimeStamp: 0,
};

const updateJCInfoList = async () => {
  if (new Date().valueOf() - footballState.JCInfoListUpdateTimeStamp > 1000 * 10) {
    footballState.JCInfoListUpdateTimeStamp = new Date().valueOf();
    try {
      const JCInfoList = await getJCInfoList();
      footballState.JCInfoListUpdateTimeStamp = new Date().valueOf();
      footballState.JCInfoList = JCInfoList.map((JCInfo) => {
        return {
          ...JCInfo,
          createdAt:
            footballState.JCInfoList.find((item) => item.matchId === JCInfo.matchId)?.createdAt ||
            new Date().toISOString(),
        };
      });
    } catch (error) {
      footballState.JCInfoListUpdateTimeStamp = 0;
    }
  }
  return footballState.JCInfoList;
};

/**获取需要更新的HG联赛数据 */
const getHGLeagueToUpdate = async () => {
  if (!footballState.JCInfoList?.length) return [];
  // HG联赛数据过期超过10分钟，就更新联赛数据
  const nowTimestamp = new Date().valueOf();
  if (nowTimestamp - footballState.HGLeagueListUpdateTimeStamp > 1000 * 60 * 10) {
    footballState.HGLeagueListUpdateTimeStamp = nowTimestamp;
    const token = await getToken();
    try {
      // console.log(
      //   'update HGLeagueList time',
      //   nowTimestamp,
      //   footballState.HGLeagueListUpdateTimeStamp,
      //   nowTimestamp - footballState.HGLeagueListUpdateTimeStamp,
      //   nowTimestamp - footballState.HGLeagueListUpdateTimeStamp > 1000 * 60 * 10
      // );
      const HGleagueItemList = await getHGLeagueListAllByToken(token.url, token.uid, token.ver);
      footballState.HGLeagueListUpdateTimeStamp = new Date().valueOf();
      footballState.HGLeagueList = HGleagueItemList;
      console.log(new Date().toISOString(), 'update HGLeagueList');
    } catch (error) {
      console.log('error update HGLeagueList:', error);
      footballState.HGLeagueListUpdateTimeStamp = 0;
    }
  }
  const toUpdateLeagueList = footballState.JCInfoList.map((JCInfo) => {
    const HGLeague = maxBy(footballState.HGLeagueList, (HGLeagueItem) =>
      getLeagueSameWeight(HGLeagueItem.name, JCInfo.leagueAllName)
    );
    return {
      JCLeagueName: JCInfo.leagueAllName,
      HGLeagueName: HGLeague?.name || '',
      HGLeagueId: HGLeague?.leagueId,
      weight: getLeagueSameWeight(JCInfo.leagueAllName, HGLeague?.name || ''),
    };
  });
  const uniqHGLeagueList = uniqBy(toUpdateLeagueList, (item) => item.HGLeagueId);
  return uniqHGLeagueList;
};

/**获取所有需要更新的HG比赛数据 */
const getHGMatchToUpdate = async (HGLeagueId: string, JCLeagueName: string) => {
  if (!footballState.JCInfoList?.length) return [];
  // HGGameListInfo不存在 就更新gameList
  if (!footballState.HGGameInfoList.find((item) => item.leagueId === HGLeagueId)) {
    footballState.HGGameInfoList = [
      ...footballState.HGGameInfoList,
      { leagueId: HGLeagueId, updateTimestamp: 0, gameList: [], JCLeagueName },
    ];
    console.log(new Date().toISOString(), 'none update HGGameInfoList leagueId:', HGLeagueId);
  }
  // HG当前联赛下的比赛
  const finedHGGameInfo = footballState.HGGameInfoList.find((item) => item.leagueId === HGLeagueId);
  // 过期了10分钟，就更新gameList
  if (finedHGGameInfo && new Date().valueOf() - finedHGGameInfo.updateTimestamp > 1000 * 60 * 10) {
    const preHGGameInfoUpdateTimestamp = finedHGGameInfo.updateTimestamp;
    finedHGGameInfo.updateTimestamp = new Date().valueOf();
    const token = await getToken();
    try {
      // 获取HG gameList
      const HGGameList = await getHGGameListByTokenAndLeagueId(token.url, token.ver, token.uid, HGLeagueId);
      finedHGGameInfo.updateTimestamp = new Date().valueOf();
      // 更新 HGGameList
      footballState.HGGameInfoList = footballState.HGGameInfoList.filter((gameInfo) =>
        //  去除HGGameInfoList中不存在于JC的league
        footballState.JCInfoList.some((JCInfo) => JCInfo.leagueAllName === gameInfo.JCLeagueName)
      ).map((info) => {
        if (info.leagueId === HGLeagueId) {
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
            updateTimestamp: new Date().valueOf(),
            leagueId: HGLeagueId,
            JCLeagueName,
          };
        }
        return info;
      });
      if (preHGGameInfoUpdateTimestamp !== 0) {
        console.log(new Date().toISOString(), 'expire update HGGameInfoList leagueId:', HGLeagueId);
      }
    } catch (error) {
      finedHGGameInfo.updateTimestamp = 0;
    }
  }
  // 获取 HGGame里的gameList
  const finedHGGameList = footballState.HGGameInfoList.find((info) => info.leagueId === HGLeagueId)?.gameList;
  if (!finedHGGameList?.length) return [];
  const toUpdateHGMatchList = footballState.JCInfoList.filter((JCInfo) => JCInfo.leagueAllName === JCLeagueName)
    .map((JCInfo) => {
      const weightItemList = finedHGGameList.map((game) => {
        const HGHomeTeam = game.homeTeam || '';
        const HGAwayTeam = game.awayTeam || '';
        const awayTeamWeight = getTeamSameWeight(HGAwayTeam, JCInfo.awayTeamAllName);
        const homeTeamWeight = getTeamSameWeight(HGHomeTeam, JCInfo.homeTeamAllName);
        return { teamWeight: awayTeamWeight + homeTeamWeight, game };
      });
      const { game, teamWeight } = maxBy(weightItemList, (item) => item.teamWeight) as (typeof weightItemList)[0];
      return { game, matchId: JCInfo.matchId, teamWeight };
    })
    .filter((item) => item.game.more && item.game.more !== '0')
    .filter((item) => {
      const finedHGInfo = footballState.HGInfoList.find((info) => item.matchId === info.matchId);
      if (!finedHGInfo) return true;
      return new Date().valueOf() - new Date(finedHGInfo.updatedAt).valueOf() > 1000 * 10;
    })
    .map(({ game, teamWeight, matchId }) => {
      return {
        HGEcid: game.ecid,
        HGLeagueId,
        JCMatchId: matchId,
        teamWeight,
      };
    });
  return toUpdateHGMatchList;
};
/**
 *
 * @param op limitMatchCount 最多可以获取几场比赛
 * @returns
 */
const updateHGInfoList = async (op: { limitMatchCount: number }) => {
  const toUpdateLeagueList = await getHGLeagueToUpdate();
  if (!toUpdateLeagueList?.length) return;
  let toUpdateHGMatchList: { HGEcid: string; JCMatchId: string; teamWeight: number; HGLeagueId: string }[] = [];
  for (const toUpdateLeague of toUpdateLeagueList) {
    const tempToUpdateHGMatchList = await getHGMatchToUpdate(
      toUpdateLeague.HGLeagueId || '',
      toUpdateLeague.JCLeagueName
    );
    toUpdateHGMatchList = [...toUpdateHGMatchList, ...tempToUpdateHGMatchList];
    if (toUpdateHGMatchList.length >= op.limitMatchCount) break;
  }
  // 更新HGInfo的isUpdating数据
  toUpdateHGMatchList.forEach((match) => {
    const finedHGInfo = footballState.HGInfoList.find((info) => info.matchId === match.JCMatchId);
    if (!finedHGInfo) {
      footballState.HGInfoList = [
        ...footballState.HGInfoList,
        {
          updatedAt: new Date().toISOString(),
          updateTime: new Date().toISOString(),
          matchId: match.JCMatchId,
        } as HGInfo,
      ];
      return;
    }
    finedHGInfo.updateTime = new Date().toISOString();
    finedHGInfo.updatedAt = new Date().toISOString();
  });
  if (!toUpdateHGMatchList?.length) return;
  const token = await getToken();
  for (const toUpdateHGMatch of toUpdateHGMatchList) {
    try {
      const gameMore = await getHGGameMore({
        ...token,
        ecid: toUpdateHGMatch.HGEcid,
        lid: toUpdateHGMatch.HGLeagueId ?? '',
      });
      if (!gameMore.serverresponse.game) continue;
      const normalPtypeGameMore = (gameMore?.serverresponse?.game ?? []).filter((item) => !item?.ptype?._text);

      const toUpdateHGInfo = {
        matchId: toUpdateHGMatch.JCMatchId,
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
        had_a: normalPtypeGameMore.find((item) => (item?.sw_M?._text ?? '').toUpperCase() === 'Y')?.ior_MC?._text || '',
        // 胜
        had_h: normalPtypeGameMore.find((item) => (item?.sw_M?._text ?? '').toUpperCase() === 'Y')?.ior_MH?._text || '',
        // 平
        had_d: normalPtypeGameMore.find((item) => (item?.sw_M?._text ?? '').toUpperCase() === 'Y')?.ior_MN?._text || '',
        ...[0, 1, 2, 3, 4, 5].reduce((re, curIndex) => {
          const isHStrong = (normalPtypeGameMore?.[curIndex]?.strong?._text ?? '').toUpperCase() === 'H';
          return {
            ...re,
            [`hhad_a${curIndex + 1}`]: normalPtypeGameMore[curIndex]?.ior_PRC?._text || '',
            [`hhad_h${curIndex + 1}`]: normalPtypeGameMore[curIndex]?.ior_PRH?._text || '',
            [`hhad_d${curIndex + 1}`]: '-',
            [`hhad_goalLine${curIndex + 1}`]: getRatioAvg(
              normalPtypeGameMore[curIndex]?.ratio?._text || '',
              isHStrong ? true : false
            ),
          };
        }, {} as HGHhad),
        wm_h1:
          normalPtypeGameMore.find((item) => (item?.sw_WM?._text ?? '').toUpperCase() === 'Y')?.ior_WMH1?._text ?? '',
        wm_h2:
          normalPtypeGameMore.find((item) => (item?.sw_WM?._text ?? '').toUpperCase() === 'Y')?.ior_WMH2?._text ?? '',
        wm_h3:
          normalPtypeGameMore.find((item) => (item?.sw_WM?._text ?? '').toUpperCase() === 'Y')?.ior_WMH3?._text ?? '',
        wm_hov:
          normalPtypeGameMore.find((item) => (item?.sw_WM?._text ?? '').toUpperCase() === 'Y')?.ior_WMHOV?._text ?? '',
        wm_a1:
          normalPtypeGameMore.find((item) => (item?.sw_WM?._text ?? '').toUpperCase() === 'Y')?.ior_WMC1?._text ?? '',
        wm_a2:
          normalPtypeGameMore.find((item) => (item?.sw_WM?._text ?? '').toUpperCase() === 'Y')?.ior_WMC2?._text ?? '',
        wm_a3:
          normalPtypeGameMore.find((item) => (item?.sw_WM?._text ?? '').toUpperCase() === 'Y')?.ior_WMC3?._text ?? '',
        wm_aov:
          normalPtypeGameMore.find((item) => (item?.sw_WM?._text ?? '').toUpperCase() === 'Y')?.ior_WMCOV?._text ?? '',
        wm_0:
          normalPtypeGameMore.find((item) => (item?.sw_WM?._text ?? '').toUpperCase() === 'Y')?.ior_WM0?._text ?? '',
        wm_n:
          normalPtypeGameMore.find((item) => (item?.sw_WM?._text ?? '').toUpperCase() === 'Y')?.ior_WMN?._text ?? '',
        ...[0, 1, 2, 3].reduce((re, curIndex) => {
          const isHStrong = (normalPtypeGameMore?.[curIndex]?.strong?._text ?? '').toUpperCase() === 'H';
          return {
            ...re,
            [`hhafu_goalLine${curIndex + 1}`]: getRatioAvg(
              normalPtypeGameMore[curIndex]?.hratio?._text || '',
              isHStrong ? true : false
            ),
            [`hhafu_h${curIndex + 1}`]: normalPtypeGameMore[curIndex]?.ior_HPRH?._text || '',
            [`hhafu_a${curIndex + 1}`]: normalPtypeGameMore[curIndex]?.ior_HPRC?._text || '',
          };
        }, {} as HGHhafu),
        updateTime: new Date().toISOString(),
        createdAt:
          footballState.HGInfoList.find((info) => info.matchId === toUpdateHGMatch.JCMatchId)?.createdAt ||
          new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      footballState.HGInfoList = footballState.HGInfoList.filter((HGInfo) =>
        // 去除HG中不存在于JC的match
        footballState.JCInfoList.some((JCInfo) => JCInfo.matchId === HGInfo.matchId)
      ).map((info) => {
        if (info.matchId === toUpdateHGInfo.matchId) return toUpdateHGInfo;
        return info;
      });
      writeFileSync('./cache/footballState.json', JSON.stringify(footballState), { encoding: 'utf-8' });
      console.log(new Date().toISOString(), 'update HGInfoList');
    } catch (error) {
      // 更新失败删除临时数据
      footballState.HGInfoList = footballState.HGInfoList.filter(
        (info) => Object.keys(info).length > 10 && info.matchId !== toUpdateHGMatch.JCMatchId
      );
    }
  }
};

(async () => {
  if(existsSync('./cache/footballState.json')) {
    const text = readFileSync('./cache/footballState.json', { encoding: 'utf-8' });
    const body = JSON.parse(text);
    Object.keys(footballState).forEach((key) => {
      footballState[key as keyof typeof footballState] = body[key];
    });
  }
  setInterval(async () => {
    await updateJCInfoList();
    await updateHGInfoList({ limitMatchCount: 5 });
  }, 1000);
})();
