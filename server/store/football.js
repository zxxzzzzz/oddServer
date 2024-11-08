import { getHGLeagueListAllByToken, getHGGameListByTokenAndLeagueId, getJCInfoList, getHGGameMore } from '../api/football.js';
import { getToken } from './hgAccount.js';
import { errorLog, getLeagueSameWeight, getRatioAvg, getSinData, getTeamSameWeight, maxBy, strFixed, uniqBy, warnLog } from '../utils/index.js';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { getOssClient } from '../api/oss.js';
import stringify from 'json-stringify-pretty-compact';
const ZERO_TIME = '2000-11-08T05:55:26.881Z';
export const footballState = {
    JCInfoList: [],
    HGInfoList: [],
    waitUpdateHGInfoList: [],
    HGLeagueList: [],
    HGGameInfoList: [],
    HGLeagueListUpdateTime: ZERO_TIME,
    JCInfoListUpdateTime: ZERO_TIME,
};
const updateJCInfoList = async () => {
    if (new Date().valueOf() - new Date(footballState.JCInfoListUpdateTime).valueOf() > 1000 * 10) {
        footballState.JCInfoListUpdateTime = new Date().toISOString();
        try {
            const JCInfoList = await getJCInfoList();
            footballState.JCInfoListUpdateTime = new Date().toISOString();
            footballState.JCInfoList = JCInfoList.map((JCInfo) => {
                return {
                    ...JCInfo,
                    createdAt: footballState.JCInfoList.find((item) => item.matchId === JCInfo.matchId)?.createdAt || new Date().toISOString(),
                };
            });
        }
        catch (error) {
            errorLog(error.message);
            footballState.JCInfoListUpdateTime = ZERO_TIME;
        }
    }
    return footballState.JCInfoList;
};
const updateAllHGLeagueList = async (op = { maxAge: 1000 * 60 * 10 }) => {
    if (!footballState.JCInfoList?.length)
        return [];
    const nowTimestamp = new Date().valueOf();
    if (nowTimestamp - new Date(footballState.HGLeagueListUpdateTime).valueOf() > op.maxAge) {
        footballState.HGLeagueListUpdateTime = new Date(nowTimestamp).toISOString();
        const token = await getToken();
        try {
            const HGleagueItemList = await getHGLeagueListAllByToken(token.url, token.uid, token.ver);
            footballState.HGLeagueListUpdateTime = new Date().toISOString();
            footballState.HGLeagueList = HGleagueItemList;
        }
        catch (error) {
            errorLog(error.message);
            footballState.HGLeagueListUpdateTime = ZERO_TIME;
        }
    }
};
const updateHGGameInfoList = async (op = { limitLeagueCount: 5, maxAge: 1000 * 60 * 10 }) => {
    if (!footballState.JCInfoList?.length)
        return [];
    if (!footballState.HGLeagueList?.length)
        return [];
    const leagueListFromJC = footballState.JCInfoList.map((JCInfo) => {
        const HGLeague = maxBy(footballState.HGLeagueList, (HGLeagueItem) => getLeagueSameWeight(HGLeagueItem.name, JCInfo.leagueAllName));
        return {
            JCLeagueName: JCInfo.leagueAllName,
            HGLeagueName: HGLeague?.name || '',
            HGLeagueId: HGLeague?.leagueId || '',
            weight: getLeagueSameWeight(JCInfo.leagueAllName, HGLeague?.name || ''),
        };
    });
    const uniqHGLeagueList = uniqBy(leagueListFromJC, (item) => item.HGLeagueId).filter((leagueItem) => {
        const finedHGGameInfo = footballState.HGGameInfoList.find((item) => item.HGLeagueId === leagueItem.HGLeagueId);
        if (!finedHGGameInfo)
            return true;
        if (finedHGGameInfo && new Date().valueOf() - new Date(finedHGGameInfo.updateTime).valueOf() > op.maxAge)
            return true;
        return false;
    });
    for (const waitLeagueItem of uniqHGLeagueList.slice(0, op.limitLeagueCount)) {
        if (!footballState.HGGameInfoList.some((item) => item.HGLeagueId === waitLeagueItem.HGLeagueId)) {
            footballState.HGGameInfoList = [
                ...footballState.HGGameInfoList,
                { HGLeagueId: waitLeagueItem.HGLeagueId, updateTime: ZERO_TIME, gameList: [], JCLeagueName: waitLeagueItem.JCLeagueName },
            ];
        }
        footballState.HGGameInfoList = footballState.HGGameInfoList.map((HGGame) => {
            if (HGGame.HGLeagueId === waitLeagueItem.HGLeagueId)
                return { ...HGGame, updateTime: new Date().toISOString() };
            return {
                ...HGGame,
            };
        });
        const token = await getToken();
        try {
            const HGGameList = await getHGGameListByTokenAndLeagueId(token.url, token.ver, token.uid, waitLeagueItem.HGLeagueId);
            footballState.HGGameInfoList = footballState.HGGameInfoList.map((HGGame) => {
                if (HGGame.HGLeagueId === waitLeagueItem.HGLeagueId)
                    return { ...HGGame, updateTime: new Date().toISOString() };
                return {
                    ...HGGame,
                };
            });
            footballState.HGGameInfoList = footballState.HGGameInfoList.filter((gameInfo) => footballState.JCInfoList.some((JCInfo) => JCInfo.leagueAllName === gameInfo.JCLeagueName))
                .map((info) => {
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
                    };
                }
                return info;
            })
                .toSorted((v1, v2) => new Date(v1.updateTime).valueOf() - new Date(v2.updateTime).valueOf());
        }
        catch (error) {
            errorLog(error.message);
            footballState.HGGameInfoList = footballState.HGGameInfoList.map((HGGame) => {
                if (HGGame.HGLeagueId === waitLeagueItem.HGLeagueId)
                    return { ...HGGame, updateTime: ZERO_TIME };
                return {
                    ...HGGame,
                };
            });
        }
    }
};
const updateWaitHGInfoList = (op = { maxAge: 1000 * 10 }) => {
    if (!footballState.JCInfoList?.length)
        return [];
    if (!footballState.HGGameInfoList?.length)
        return [];
    for (const HGGameInfo of footballState.HGGameInfoList) {
        const HGGameList = HGGameInfo.gameList;
        if (!HGGameList?.length)
            continue;
        const toUpdateHGMatchList = footballState.JCInfoList.filter((JCInfo) => JCInfo.leagueAllName === HGGameInfo.JCLeagueName)
            .map((JCInfo) => {
            const weightItemList = HGGameList.map((game) => {
                const HGHomeTeam = game.homeTeam || '';
                const HGAwayTeam = game.awayTeam || '';
                const awayTeamWeight = getTeamSameWeight(HGAwayTeam, JCInfo.awayTeamAllName);
                const homeTeamWeight = getTeamSameWeight(HGHomeTeam, JCInfo.homeTeamAllName);
                return { teamWeight: awayTeamWeight + homeTeamWeight, game };
            });
            const { game, teamWeight } = maxBy(weightItemList, (item) => item.teamWeight);
            return { game, matchId: JCInfo.matchId, teamWeight, HGLeagueId: HGGameInfo.HGLeagueId };
        })
            .filter((item) => item.game.more && item.game.more !== '0')
            .filter((item) => {
            const waitHgInfo = footballState.waitUpdateHGInfoList.find((waitItem) => waitItem.JCMatchId === item.matchId);
            const finedHGInfo = footballState.HGInfoList.find((info) => item.matchId === info.matchId);
            const isHgInfoExpired = new Date().valueOf() - new Date(finedHGInfo?.updatedAt || 0).valueOf() > op.maxAge;
            if (!waitHgInfo)
                return isHgInfoExpired;
            if (waitHgInfo.updateState === 'done')
                return true;
            return false;
        })
            .map(({ game, teamWeight, matchId, HGLeagueId }) => {
            return {
                HGEcid: game.ecid,
                HGLeagueId,
                JCMatchId: matchId,
                teamWeight,
                updateState: 'todo',
                addedTime: new Date().toISOString(),
            };
        });
        footballState.waitUpdateHGInfoList = uniqBy([...toUpdateHGMatchList, ...footballState.waitUpdateHGInfoList], (item) => item.JCMatchId)
            .filter((item) => {
            const isWaitHgInfoExpired = new Date().valueOf() - new Date(item.addedTime).valueOf() > 1000 * 60 * 1;
            if (item.updateState === 'done')
                return false;
            if (item.updateState === 'doing' && isWaitHgInfoExpired)
                return false;
            if (item.updateState === 'todo' && isWaitHgInfoExpired)
                return false;
            return true;
        })
            .toSorted((v1, v2) => new Date(v1.addedTime).valueOf() - new Date(v2.addedTime).valueOf());
    }
};
const updateHGInfoList = async (op) => {
    if (!footballState.JCInfoList?.length)
        return [];
    const waitMatchList = footballState.waitUpdateHGInfoList.filter((v) => v.updateState === 'todo').slice(0, op.limitMatchCount);
    if (!waitMatchList?.length)
        return [];
    footballState.waitUpdateHGInfoList = footballState.waitUpdateHGInfoList.map((stateItem) => {
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
            const finedStateItem = footballState.waitUpdateHGInfoList.find((stateItem) => stateItem.JCMatchId === waitHGMatch.JCMatchId);
            if (finedStateItem) {
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
                had_a: strFixed(normalPtypeGameMore.find((item) => (item?.sw_M?._text ?? '').toUpperCase() === 'Y')?.ior_MC?._text || ''),
                had_h: strFixed(normalPtypeGameMore.find((item) => (item?.sw_M?._text ?? '').toUpperCase() === 'Y')?.ior_MH?._text || ''),
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
                }, {}),
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
                }, {}),
                updateTime: new Date().toISOString(),
                createdAt: footballState.HGInfoList.find((info) => info.matchId === waitHGMatch.JCMatchId)?.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            footballState.HGInfoList = uniqBy([toUpdateHGInfo, ...footballState.HGInfoList], (item) => item.matchId).filter((HGInfo) => footballState.JCInfoList.some((JCInfo) => JCInfo.matchId === HGInfo.matchId));
            const finedItem = footballState.waitUpdateHGInfoList.find((waitStateItem) => waitStateItem.JCMatchId === waitHGMatch.JCMatchId);
            if (finedItem) {
                finedItem.updateState = 'done';
            }
        }
        catch (error) {
            errorLog(error.message);
            const finedItem = footballState.waitUpdateHGInfoList.find((waitItem) => waitItem.JCMatchId === waitHGMatch.JCMatchId);
            if (finedItem) {
                finedItem.updateState = 'done';
            }
        }
    }
};
export function getSinInfoList(op, JCInfoList, HGInfoList) {
    const sinInfoList = (JCInfoList || [])
        .filter((jcInfo) => jcInfo.matchId)
        .map((jcInfo) => {
        const hgInfo = (HGInfoList || []).filter((jcInfo) => jcInfo.matchId).find((hg) => hg.matchId === jcInfo.matchId);
        if (hgInfo) {
            return getSinData(jcInfo, hgInfo, op);
        }
        return void 0;
    })
        .filter((v) => !!v)
        .flat();
    return sinInfoList;
}
export async function updateFootballStateToOss(op) {
    const OSS_FILE_NAME = 'footballState.json';
    try {
        const ossClient = getOssClient(op);
        await ossClient.put(OSS_FILE_NAME, Buffer.from(stringify(footballState)));
        console.log(new Date().toISOString(), 'oss updateHGInfoList');
    }
    catch (error) {
        errorLog(error.message);
        console.log('put error', error);
    }
}
export async function updateFootballStateFromOss(op) {
    const OSS_FILE_NAME = 'footballState.json';
    try {
        const ossClient = getOssClient(op);
        const res = await ossClient.get(OSS_FILE_NAME);
        const content = res.content;
        if (!content)
            return;
        const ossFootballState = JSON.parse(content);
        Object.entries(ossFootballState).forEach(([k, v]) => {
            footballState[k] = v;
        });
        console.log(new Date().toISOString(), 'update from oss');
    }
    catch (error) {
        errorLog(error.message);
        console.log('put error', error);
    }
}
export async function updateFootballStateFromWeb() {
    if (existsSync('./cache/footballState.json') && footballState.JCInfoListUpdateTime === ZERO_TIME) {
        const text = readFileSync('./cache/footballState.json', { encoding: 'utf-8' });
        const body = JSON.parse(text);
        Object.keys(footballState).forEach((key) => {
            const v = body[key];
            if (v !== void 0) {
                footballState[key] = v;
            }
        });
    }
    await updateJCInfoList();
    await updateAllHGLeagueList();
    await updateHGGameInfoList({ limitLeagueCount: 5, maxAge: 1000 * 60 * 10 });
    updateWaitHGInfoList({ maxAge: 1000 * 10 });
    await updateHGInfoList({ limitMatchCount: 5 });
    writeFileSync('./cache/footballState.json', stringify(footballState), { encoding: 'utf-8' });
}
