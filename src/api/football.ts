import { reLogin } from '../store/hgAccount.js';
import { cuFetch } from './request.js';
import { objToFormData } from './utils.js';
import Convert from 'xml-js';
import { GameList, GameMore, GameOBT } from '../type/index.js';
import { JCInfo } from '../type/index.js';
import { toAsyncTimeFunction } from '../utils/lodash.js';

export const getHGLeagueListAllByToken = toAsyncTimeFunction(async function (
  url: string,
  uid: string,
  ver: string,
  count?: number
): Promise<{ name: string; leagueId: string }[]> {
  if (count !== undefined && count < 0) throw Error('getLeagueListAllByNodeFetch 递归太多');
  const body = {
    p: 'get_league_list_All',
    uid: uid,
    ver: ver,
    langx: 'zh-cn',
    gtype: 'FT',
    FS: 'N',
    showtype: 'p3',
    date: 'all',
    ts: new Date().valueOf(),
    nocp: 'N',
  };
  const _url = new URL(url);

  const res = await cuFetch(`${_url.origin}/transform.php?ver=${ver}`, {
    headers: {
      accept: '*/*',
      'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
      'sec-ch-ua': '"Chromium";v="112", "Microsoft Edge";v="112", "Not:A-Brand";v="99"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
    },
    body: objToFormData(body),
    method: 'post',
  });
  const text = await res.text();
  if (!text) {
    throw Error('getLeagueListAllByNodeFetch 获取extra 联赛数据失败 数据空');
  }
  const mixObj = Convert.xml2js(text, { compact: true }) as any;
  if (mixObj?.serverresponse?.code?._text === 'error') {
    await reLogin(uid);
    return getHGLeagueListAllByToken(url, uid, ver, (count || 5) - 1);
  }
  return (mixObj?.serverresponse?.classifier?.region || [])
    .map((r: any) => {
      const league = r.league?.length ? r.league : [r.league];
      return league.map((l: any) => {
        const name = l._attributes.name;
        const id = l._attributes.id;
        return { name, leagueId: id };
      });
    })
    .flat();
}, 'getHGLeagueListAllByToken')

export const getHGGameListByTokenAndLeagueId = toAsyncTimeFunction(async function (
  url: string,
  ver: string,
  uid: string,
  lid: string,
  count?: number
): Promise<GameList> {
  if (count !== undefined && count < 0) throw Error('getGameListByTokenAndLeagueId 递归太多');
  const body = {
    uid: uid,
    ver: ver,
    langx: 'zh-cn',
    p: 'get_game_list',
    p3type: '',
    date: 'all',
    gtype: 'ft',
    showtype: 'parlay',
    rtype: 'rb',
    ltype: 3,
    lid: lid,
    action: 'click_league',
    sorttype: 'L',
    specialClick: '',
    isFantasy: 'N',
    ts: new Date().valueOf(),
  };
  const _url = new URL(url);
  const res = await cuFetch(`${_url.origin}/transform.php?ver=${ver}`, {
    method: 'post',
    headers: {
      accept: '*/*',
      'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
      'sec-ch-ua': '"Chromium";v="112", "Microsoft Edge";v="112", "Not:A-Brand";v="99"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
    },
    body: objToFormData(body),
  });
  const text = await res.text();
  const mixObj = Convert.xml2js(text, { compact: true }) as any;
  if (mixObj?.serverresponse?.code?._text === 'error') {
    await reLogin(uid);
    return getHGGameListByTokenAndLeagueId(url, ver, uid, lid, (count || 5) - 1);
  }
  return mixObj;
}, 'getHGGameListByTokenAndLeagueId')

export const getHGGameOBTByTokenAndEcid = toAsyncTimeFunction(async function (
  url: string,
  ver: string,
  uid: string,
  ecid: string,
  count?: number
): Promise<GameOBT> {
  const body = {
    uid: uid,
    ver: ver,
    langx: 'zh-cn',
    p: 'get_game_OBT',
    gtype: 'ft',
    showtype: 'live',
    isSpecial: '',
    isEarly: 'N',
    model: 'ROU|MIX',
    isETWI: 'N',
    ecid: ecid,
    ltype: 3,
    is_rb: 'Y',
    isClick: 'Y',
  };
  const body2 = {
    uid: uid,
    ver: ver,
    langx: 'zh-cn',
    p: 'get_game_OBT',
    gtype: 'ft',
    showtype: 'live',
    isSpecial: '',
    isEarly: 'N',
    model: 'ROU|MIX',
    isETWI: 'N',
    ecid: ecid,
    ltype: 3,
    is_rb: 'Y',
    isClick: 'Y',
  };
  const _url = new URL(url);
  const res = await cuFetch(`${_url.origin}/transform.php?ver=${ver}`, {
    headers: {
      accept: '*/*',
      'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
      'sec-ch-ua': '"Chromium";v="130", "Microsoft Edge";v="130", "Not?A_Brand";v="99"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      Referer: 'https://m172.mos077.com/',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
    method: 'POST',
    body: objToFormData(body2),
  });
  const text = await res.text();
  let mixObj = Convert.xml2js(text, { compact: true }) as any;
  if (mixObj?.serverresponse?.code?._text === 'error') {
    await reLogin(uid);
    return getHGGameOBTByTokenAndEcid(url, ver, uid, ecid, (count || 5) - 1);
  }
  if (!mixObj?.serverresponse?.ec?.game) {
    const res = await cuFetch(`${_url.origin}/transform.php?ver=${ver}`, {
      headers: {
        accept: '*/*',
        'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
        'sec-ch-ua': '"Chromium";v="130", "Microsoft Edge";v="130", "Not?A_Brand";v="99"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        Referer: 'https://m172.mos077.com/',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
      },
      method: 'POST',
      body: objToFormData(body),
    });
    const text = await res.text();
    mixObj = Convert.xml2js(text, { compact: true }) as any;
  }
  return mixObj;
}, 'getHGGameOBTByTokenAndEcid')

export const getHGGameMore = toAsyncTimeFunction(async function (
  op: { uid: string; ver: string; lid: string; ecid: string; url: string },
  count = 5
): Promise<GameMore> {
  const body = {
    uid: op.uid,
    ver: op.ver,
    langx: 'zh-cn',
    p: 'get_game_more',
    gtype: 'ft',
    showtype: 'parlay',
    ltype: '3',
    isRB: 'N',
    lid: op.lid,
    specialClick: '',
    mode: 'NORMAL',
    filter: 'Main',
    ecid: op.ecid,
  };
  const _url = new URL(op.url);
  const res = await cuFetch(`${_url.origin}/transform.php?ver=${op.ver}`, {
    headers: {
      accept: '*/*',
      'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
      'sec-ch-ua': '"Chromium";v="130", "Microsoft Edge";v="130", "Not?A_Brand";v="99"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      Referer: 'https://m172.mos077.com/',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
    body: objToFormData(body),
    method: 'POST',
  });
  const text = await res.text();
  let mixObj = Convert.xml2js(text, { compact: true }) as any;
  if (mixObj?.serverresponse?.code?._text === 'error') {
    await reLogin(op.uid);
    return getHGGameMore(op, count - 1);
  }
  return mixObj as GameMore;
}, 'getHGGameMore')

export const getJCInfoList = toAsyncTimeFunction(async function (count = 5):Promise<JCInfo[]> {
  if (count <= 0) throw Error('getJCInfoList 请求次数超过');
  const res = await cuFetch(
    'https://webapi.sporttery.cn/gateway/jc/football/getMatchCalculatorV1.qry?poolCode=hhad,had,ttg,hafu&channel=c',
    {
      headers: {
        accept: 'application/json, text/javascript, */*; q=0.01',
        'accept-language': 'zh-CN,zh;q=0.9',
        'cache-control': 'no-cache',
        pragma: 'no-cache',
        'sec-ch-ua': '"Google Chrome";v="111", "Not(A:Brand";v="8", "Chromium";v="111"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
        Referer: 'https://www.sporttery.cn/',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
      },
    }
  );
  const text = await res.text();
  if (text.includes('html')) {
    return getJCInfoList(count - 1);
  }
  const data = JSON.parse(text);
  const matchInfoList = data?.value?.matchInfoList as any[];
  const JCInfoList = (matchInfoList ?? [])
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
        updateTime: new Date().toISOString(),
        createdAt: match?.createdAt ?? '',
        updatedAt: new Date().toISOString(),
      };
    });
  return JCInfoList as JCInfo[];
}, 'getJCInfoList')
