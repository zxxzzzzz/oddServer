// deno-lint-ignore-file no-explicit-any
import { getToken } from '../store/hgAccount.ts';
import { cuFetch } from './request.ts';
import { delay, objToFormData } from './utils.ts';
import Convert from 'xml-js';
import { GameList, GameMore, GameOBT } from '../type/index.ts';
import { isXml, toAsyncTimeFunction } from '../utils/lodash.ts';

const RETRY_DELAY = 1000 * 10;

export const getHGLeagueListAll = toAsyncTimeFunction(
  async function (): Promise<{ name: string; leagueId: string }[] | undefined> {
    const { uid, ver, url, reLogin } = await getToken();
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
    if (!res) {
      await reLogin();
      await delay(RETRY_DELAY);
      return getHGLeagueListAll();
    }
    const text = await res.text();
    if (!text) {
      await reLogin();
      await delay(RETRY_DELAY);
      return getHGLeagueListAll();
    }
    if (!isXml(text)) {
      await reLogin();
      await delay(RETRY_DELAY);
      return getHGLeagueListAll();
    }
    const mixObj = Convert.xml2js(text, { compact: true }) as any;
    if (mixObj?.serverresponse?.code?._text === 'error') {
      await reLogin();
      await delay(RETRY_DELAY);
      return getHGLeagueListAll();
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
  },
  { tag: 'getHGLeagueListAll', desc: '' }
);

export const getHGGameList = toAsyncTimeFunction(
  async function (op: { lid: string }): Promise<GameList | undefined> {
    const { uid, ver, url, reLogin } = await getToken();
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
      lid: op.lid,
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
    if (!res) {
      await reLogin();
      await delay(RETRY_DELAY);
      return getHGGameList(op);
    }
    const text = await res.text();
    if (!isXml(text)) {
      await reLogin();
      await delay(RETRY_DELAY);
      return getHGGameList(op);
    }
    const mixObj = Convert.xml2js(text, { compact: true }) as any;
    if (mixObj?.serverresponse?.code?._text === 'error') {
      await reLogin();
      await delay(RETRY_DELAY);
      return getHGGameList(op);
    }
    return mixObj;
  },
  {
    tag: 'getHGGameList',
    desc: (args) => 'lid:' + args[0].lid,
  }
);

export const getHGGameOBT = toAsyncTimeFunction(
  async function (op: { ecid: string }): Promise<GameOBT | undefined> {
    const { uid, ver, url, reLogin } = await getToken();
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
      ecid: op.ecid,
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
      ecid: op.ecid,
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
    if (!res) {
      await reLogin();
      await delay(RETRY_DELAY);
      return getHGGameOBT(op);
    }
    const text = await res.text();
    if (!isXml(text)) {
      await reLogin();
      await delay(RETRY_DELAY);
      return getHGGameOBT(op);
    }
    let mixObj = Convert.xml2js(text, { compact: true }) as GameOBT;
    // @ts-expect-error code存在
    if (mixObj?.serverresponse?.code?._text === 'error') {
      await reLogin();
      await delay(RETRY_DELAY);
      return getHGGameOBT(op);
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
      if (!res) {
        await reLogin();
        await delay(RETRY_DELAY);
        return getHGGameOBT(op);
      }
      const text = await res.text();
      if (!isXml(text)) {
        await reLogin();
        await delay(RETRY_DELAY);
        return getHGGameOBT(op);
      }
      mixObj = Convert.xml2js(text, { compact: true }) as GameOBT;
      // @ts-expect-error code存在
      if (mixObj?.serverresponse?.code?._text === 'error') {
        await reLogin();
        await delay(RETRY_DELAY);
        return getHGGameOBT(op);
      }
    }
    return mixObj;
  },
  {
    tag: 'getHGGameOBT',
    desc: (args) => 'ecid:' + args[0].ecid,
  }
);

export const getHGGameMore = toAsyncTimeFunction(
  async function (op: { lid: string; ecid: string }): Promise<GameMore | undefined> {
    const { uid, ver, url, reLogin } = await getToken();
    const body = {
      uid: uid,
      ver: ver,
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
      body: objToFormData(body),
      method: 'POST',
    });
    if (!res) {
      await reLogin();
      await delay(RETRY_DELAY);
      return getHGGameMore(op);
    }
    const text = await res.text();
    if (!isXml(text)) {
      await reLogin();
      await delay(RETRY_DELAY);
      return getHGGameMore(op);
    }
    const mixObj = Convert.xml2js(text, { compact: true }) as GameMore;
    if (mixObj?.serverresponse?.code?._text === 'error') {
      await reLogin();
      await delay(RETRY_DELAY);
      return getHGGameMore(op);
    }
    return mixObj;
  },
  {
    tag: 'getHGGameMore',
    desc: (args) => `leagueId:${args[0].lid} ecid:${args[0].ecid}`,
  }
);

/**二串一 */
export const getJCInfoList = toAsyncTimeFunction(
  async function (): Promise<any> {
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
    if (!res) {
      await delay(RETRY_DELAY);
      return getJCInfoList();
    }
    const text = await res.text();
    if (text.includes('html')) {
      await delay(RETRY_DELAY);
      return getJCInfoList();
    }
    const data = JSON.parse(text);
    return data
  },
  { tag: 'getJCInfoList', desc: '' }
);
