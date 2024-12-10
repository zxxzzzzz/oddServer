import { getToken } from '../store/hgAccount.ts';
import { delay, isXml } from '../utils/index.ts';
import { cuFetch } from './request.ts';
import { objToFormData } from './utils.ts';
import Convert from 'xml-js';

const RETRY_DELAY = 1000 * 10;

export async function getJCBasketballInfoList() {
  // https://webapi.sporttery.cn/gateway/jc/basketball/getMatchCalculatorV1.qry?poolCode=hdc&channel=c
  const res = await cuFetch('https://webapi.sporttery.cn/gateway/jc/basketball/getMatchCalculatorV1.qry?poolCode=hdc,hilo,mnl&channel=c', {
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
  });
  if (!res) {
    await delay(RETRY_DELAY);
    return getJCBasketballInfoList();
  }
  const text = await res.text();
  if (text.includes('html')) {
    await delay(RETRY_DELAY);
    return getJCBasketballInfoList();
  }
  const data = JSON.parse(text);
  return data;
}

export async function getHGBasketballGameList(op:{lid: string}): Promise<Game[]> {
  const { uid, ver, url, reLogin } = await getToken();
  const body = {
    uid: uid,
    ver: ver,
    langx: 'zh-cn',
    p: 'get_game_list',
    p3type: '',
    date: 'all',
    gtype: 'bk',
    showtype: 'parlay',
    rtype: 'r',
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
    method: 'POST',
    body: objToFormData(body),
  });
  if (!res) {
    await reLogin();
    await delay(RETRY_DELAY);
    return getHGBasketballGameList(op);
  }
  const text = await res.text();
  if (!isXml(text)) {
    await reLogin();
    await delay(RETRY_DELAY);
    return getHGBasketballGameList(op);
  }
  const mixObj = Convert.xml2js(text, { compact: true }) as any;
  if (mixObj?.serverresponse?.code?._text === 'error') {
    await reLogin();
    await delay(RETRY_DELAY);
    return getHGBasketballGameList(op);
  }
  return mixObj;
}
