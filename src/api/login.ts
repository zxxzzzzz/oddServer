import { cuFetch } from './request.js';
import { objToFormData, obj2Str } from './utils.js';
import Convert from 'xml-js';

export async function loginByAccount(username: string, password: string, url: string) {
  const res = await cuFetch(`${url}/?detection=Y`, {
    headers: {
      accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'accept-language': 'zh-CN,zh;q=0.9',
      'cache-control': 'no-cache',
      pragma: 'no-cache',
      'sec-ch-ua': '"Google Chrome";v="113", "Chromium";v="113", "Not-A.Brand";v="24"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'document',
      'sec-fetch-mode': 'navigate',
      'sec-fetch-site': 'same-origin',
      'sec-fetch-user': '?1',
      'upgrade-insecure-requests': '1',
      Referer: 'https://extraa.com/',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
  });
  const text = await res.text();
  const m = text.match(/top\.ver = '([^']+?)'/);
  if (!m?.[1]) {
    throw Error('login-获取ver失败');
  }
  const ver = m[1];

  // fetch("https://m172.mos077.com/transform.php?ver=2024-10-01-OBTfix_51", {
  //   "headers": {
  //     "accept": "*/*",
  //     "accept-language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
  //     "content-type": "application/x-www-form-urlencoded",
  //     "sec-fetch-dest": "empty",
  //     "sec-fetch-mode": "cors",
  //     "sec-fetch-site": "same-origin",
  //     "cookie": "CookieChk=WQ==; protocolstr=aHR0cHM=; cuipv6=WQ==; cu=WQ==; ipv6=WQ==; loadBB=WQ==",
  //     "Referer": "https://m172.mos077.com/",
  //     "Referrer-Policy": "strict-origin-when-cross-origin"
  //   },
  //   "body": "p=chk_login&langx=zh-cn&ver=2024-10-01-OBTfix_51&username=CXGCXG717&password=ASd12345&app=N&auto=EICAAD&blackbox=0400@ixVzIWcm@CVebKatfMjIDOg5mLCmMOfvPPtPD4qMkh8qkD0exQ0R02wa0tiH7upuZ5TMhOBRAY8V/rfihEZPZRvFCMSbl5xi@j/EsB67AoqauP3kCAMOGTmOqLA3SnRNfaGy@wKmtF4Qz3Cs6@yYtgrhLOsaydVW8ti0S17Mbyih2/27HARZd9HZxYpQdWs8VWo4o1/6JRFHyVF5@9K7uyYSxB9OqPIp8eEyxS8VvqbTcBtdNR@EZkTcSPtezlByApDqQR98wyqeH0OpGUadv6a@9aA@etanzlZKp9bEmwhN7hb4eJ4avgeiutxc9mETn3ScfrBfYQ19obL7Aqa0XhDPcKzr7Ji2CuEs6xrJ1Vby2LRLXsxvKKHb/bscBFl30dnFilB1azvUSbJ@Ltz3R3@1lLYqHZE0NVq2@Rz/T3tsM9ltPyKX92TL5tGQnomb@O5jfppV2@lIX@ZzrDnrFllSJpS7u3@tmA6a/ZVLuXO5bbqa1ZIVhRO4RA9puRdW/CToxSzv5adL/EbqkP@a0cjPr@IS1lrhZiojDYOGvNqnQBIdNiYRm8ZcEhxjnwrrUK9hS4ZWkwEyFy80Yih5Z5lLp2y3eUwcWvLjaktWoiOo6/BTgXkua3w4oOY6NQedPWovEZc9d8OScgjZ2DrowXojk4bF91PKPP7Ec@2O4THKtQyJ0pA90N13n2vmAeytJRmnJsVxcAILXKPYzpp/GO7P/zAA1mnWIkgtU19Wgzd0HwZFZsoI34Rvy8jU9/oxS9GTGQ/PXGUReO78f8dn4s//BPd61qfqLx0lxyJoIltSlvmbRKgOWcRvLGt/5UcaDjwEADjowE1Opss@2iAz14aHRGLwsrsEusQWSd5obNMRV0YmXEHAGKAO31T@YhItvz@T7bHfxZXqLz@1vlqUAr9dE2jcfl0lKNYpaK1iN3MEI3UUTmnb5oO7ycIyABeqIvdDnb4Zco0tE9dx3XHse0PoUYVsMEwrRZ1Nw@Dd31GASpJ6ETmLRJj7bhOxJDzfE7H/TDVL1E/yoVIBnjaisB2n/X/DCQnvsrYa7nViyCtYINXcJUm3xGpKxGRzy3myeAVsARqo4xHDo0vYYDC38rs3u50SOXcoF2qm4h/UZQSj1WSgXZQ/fCH@j0uJzm@YVEIS08I9cjXIj00GhUM5u6KD/Ap4zXwZpQRyqKemuJqTUnBSvUYsNwTidneZ5Wedvp3EOKiSx7uHGOjLfVqUWaUEcqinpriak1JwUr1GLDcE4nZ3meVnnb6dxDiokse7hxjoy31alFmlBHKop6a4ulGXILklDIVCbryu9G8AaTIauRtCQwBH1VKft@Y8hxZw5rNRhjMFvlSwejOX5dhKGYrsu13rc4R1YYITyzRwv8PXXpOa/Fh/ax3LxO6wXtzDRAaY/eQ7VuEMnibN2tQpOpNamMbgPUbzv/Wq4CfB@lYIw2zZSAghIFRGeX4@Xjnwa8doqzIkuwWZBamlGXoG1V86uBA@AcpBuHoK/L2C095VpgkQXTQzcUDSdGvQZJO2VaLJ9pv1mBQhdCka8OMcGFfXBnuF90tu6828R9GQm4rjPTHBnP/ukQgPzK/B9rQjsNn3NdYs7d@huI6Fw40k82cGDz2TnqsW6E5T7SjbTuqBCdF6UcylrGAqHKF92svmWFrOZ4B1Lp9xD6KYGuP2YbamY1MUAnGgiFKOsXcSILjFijINS9@MWCtJpkmxKJc/9EzqitIU7unBB@YOwhnBW5W0fT1RYFrtAop9ur3eOywb6ufBQksTe7J92Ykwts7Z1GHRtxUbfwR0AXiOOsg8vCRi3dQn6ozCtfe4SKCq48E/26HtWAF3evT/@wnS5Bs@OrQgNttqoskLcU/AxyKsMHmTi4yRFwifdjjw4wRMEqziBBkVbZqNPsSqUx@3IHXJ4pFUPALNCdim2mLqR1OssEJ96C56fOo90S7AbPnnf4WuGCdJ6sP0pxSY1DdVpEfcTtkQ9e89/9e/728hGV9pfLEMokGoGJxIpJQceGZLcSgYjhFIu8rPsQPcd6kSm4zHN0URjnyiUCW/40pM8u5mSAz6pKQhNLD9nXXyphcepAhU4PR@8Is4UNYqtbkyp9eD7aQHBB5wJUfay7znxv7zI1fOgOtdpg3BsGojDj9YfuhGsrLDqxlZecyMd5JmytOpOYTaSxESZgPznuuZ4TAPaXLUv7y@XcxOGN@L@9GuhP339N5k9rDGA3UhYXfdKDY4czXy12a@Xj6AlGJPY5ZoEWyzUcQuTeXXFuerLTC43FcfzU3KnpWEaPyakMvFSIAW7kfSM8lhYvHXG/jAQo0bHo5bQ04x53VARAtUOA5IlXtGIJX8DvqSxSt2WMYe@RgbBlTzHU/ER1zfWYs9eQC5xzQ3JibtA/ccO6hPPyzDU9LsfbCp2NFHCvGywcnx3ZrVqtngwsbSm/J75zoa@PIvtrVsehZ@MkBbc1x6dipnTsPyEXslq7z/8NTvJNUY9e3LBrvYqMlOrpCSOP8F/eyAHq/z1KcKTtqXfd8P8IRcr1TKEXPWXDnX6KCAEc9IaFe3T0I7uSmqz2B1zgRopF2Fq@R62Y2lnl1lfEpW@XqMo7OEuevr29xE2QQ7BnC97Z6/63aIRZb@39AudaF09Pqol9IOPAQggyB3iSu3htbofHvTNDM8jKDmUodOZ0e1WwB9trc5e@WyhHmlz6jSwYUXaXKBgWYjDL2pJsZX@KNPnMsQQaeu9R1rU8rxF30Ly9wSNkiEF9PZ6IxzVOGuDGokJB@ykTjcN5UDXI@@CWq6JOXEHvu84OnjjAWQGBukRrAuyiTVjrFUnp15zCoF0Dclm5md@LwPnC8fsLmuZvDKcd2KT4EIhFconQ@rlIMTewVhRJLGBGeFVM=;0400K6s@Dab1SY/jK9GFecOQi@yM9uTpeOclvxy0iyrajeiRIYbWxA9d9fBGIbaLXGUDTvOPWZZERxZ@99zTNwM6lY1KtGYeaD1enpJkimhbZiS0fStrvp8hmjCGQCDm@3xnn1vOt@XESqik25FrpLox4N36g5wKGuww8VWo4o1/6JQewkJFe4qUGeGRCOD/@f7Sp7lOnn2jJXA6vmMhoDXI5yRFidfbzH0/NNlLu696s3rBJODTFUBzlf6a@9aA@etanzlZKp9bEmwhN7hb4eJ4aoUagE0hLr02Tn3ScfrBfYSsDuuY9ZH8WhJdbZ7sTkl9Vhu/x5rsbS7SutwIwxcvY6gcxA4pTQAXkkovWMHc9uG4kGxltzkpNaqNTm538dVhZndwDJQOTJrvUSbJ@Ltz3R3@1lLYqHZE0NVq2@Rz/T3tsM9ltPyKX3UHzghRrLAQb@O5jfppV2@lIX@ZzrDnrFllSJpS7u3@tmA6a/ZVLuXO5bbqa1ZIVhRO4RA9puRdW/CToxSzv5adL/EbqkP@a0cjPr@IS1lrhZiojDYOGvNqnQBIdNiYRm8ZcEhxjnwrrUK9hS4ZWkwEyFy80Yih5Z5lLp2y3eUwcWvLjaktWoiOo6/BTgXkua3w4oOY6NQedGqYJRx4R5t01CkIv@mYS862rUhB@@MQAsEb5KdHtSVjk@7s9IeOl1L0DwLqNi4CgAt0n0e3Xki0lGacmxXFwMJx7HRqoQ9qJ7bCPSQ823Kn/ZjN/sPWSD@dIPZrty4ZedyPels7jcFlHVB6chrI7u8mR20/oWqfE9LST5p23mUwt6O60biHEp/zHesqjPHSKA75SqnFv74o110bIle@hQMkd6U89LMlyLUGV0m0WcpT/j3HsP3lK4iu6TAsPc3U5NAePLsfleEGZIIYlfN6@LKanxEVV2PsvFQ3SxgXyvTx/y4JwLTE4NiHx6YyfC5nS8rJRSOzkwJFaRYe7mA6xftSMTUV4SIyNBXjhjJdMKa@vK2OlpX/h8ngFbAEaqOMLD4mV3TQqnzvQvLMivTNJBByE0qFys4MJiDbCfVZTGBk19tyNs7g8/zTXiSaBbf1hoTF51bfP1/qyEJHiMpz05KZnXTUzdcstSVPrbgATwjJ1Okz2o91poMpuo0JeQGsoaHh7kteujGljzOC8rHfIxgF74x9JktQDKThVP1hAyCQqsH6hMgZ9x0R9vRNj5evLzdF6XhbUccUUA3pDXHzRR0J0Z3KrDBtMp15KDg/66MdEfb0TY@Xry83Rel4W1HHFFAN6Q1x80UdCdGdyqwwbTKdeSg4P@ujHRH29E2Pl68vN0XpeFtRxyCofHI9aHmKVfC7H5OBzPJr0SERa@T0bVPeImNr/UVPV6i8/tb5alAK/XRNo3H5dNOHjs7HO5CL//li8nYbsqLpi94ovlsN68Nne3GWGxBsGkgnVvJhnLTokpKH6zy0FykaEiBB3lJ75LkN1pnECcb3tXHW0biNyMTNMFyq7LHBSNfOTvsgtn8jOD/jjdG1bJnnhvo5dwP0TzEBdNLiXsNS5LoCa7Ohp94auk7waAOydW2I1dOcYZQ8STXLOO25/7eOYKpDDGGHQBWWLTqbaMYoyZWXoBiDDNQeGwCeB4LeJP@uJSqKjN8A6K3HjRQPNi/w5rk2aLUUb9DdoXF5Bq6Q2sBcS9tbDshq5G0JDAEfRou0PT5aseVLrByVovu/@n8psKE4QnpndJ37dxBDm5A2CR8F/UVVN4uiJKm1VlOOXjEMuEsdlXF3a/MVWSKOVC41F1YkC/9GXQeIu0rYNbp5QriwQnrlIaT6WVVS27OKoI@9uLBHBOOghWwLOr/Ln2x7W1gtmfVBQaXsP5EHcplVvfIGjwGQOe48FvMboXnQoa0fCCbiWg4YkuMtBROWNFQW1PThYuTjZfHycBD/YEqAbgsspId@VuKUvwrQEckl0HPty63HLm6s6wsUVjjEacJSle4L0Q0iSwV9m9mdgtTl0UTaSKIaSuqGueuY3v0E0RIcZLJBvkQliiJRuK@W3Wb@tMOhdb6fjB1w4yyPAdZri73AAaNQDOt74G6sc2kicvttnD1@LSnvTNDM8jKDmXYpPgQiEVyidD6uUgxN7BXzBngSaW/U1rFt29Nm9E0wSuOCSs63ilVYZF4bWLk5VmEODqcSmwlKrCq2SH5g9qu7HLiS6doU17mCt@Nu5QXfmtj/bWI/vrNGhMKdq7El8AFmri0HluWMgCi/IUYfrFlJr/aZPlgyFnzsBpWgGbFlnh2H4Fnt5h3uqMGG5iucqd1mMYYV0atwHgoyK2DF/Lm3Y6dFgbRNbCd5VPt04yqbB5@fSyAQmdvqOIDef8x1TVh0E5P965GPJkHxak9vqvAGfpQ@mlukTLLmWoLaJUb9It7t4FqmX1tbp6VVnlbD1TIttHBSb46LbUyNsg3SDJ8823HdqRC5dkntGuXTRSGWF8vY637DtjoPopgvFjUlWimaEO2YyJeoKVSQIQXQOExOpTNYOmHAV7e4tYmvRksWdQ78YTl2t38HYYNdyOmCGfSCVHZYDAPbiQVaBlYkVluaujyQYh1ABEECTCFB@sKclXpbQ1LUOTfy1A7mS5ay6DWAbaglId/KL27Hdz7T9DhYYLOSfaT2c4KzsiCoeRXpaHN5mATvLuNelmF8UU7XD0E10EM6hz5ddV7BuuV0sHdb3G2atTNrn4IIbkh1t7v5iyFl2iJXaUozZjTllbdaqFANXEDBrQiSNRMlbklSdDY3NjGqQTqMPQV8E/zeQn29DlXg4AuCctk=&userAgent=TW96aWxsYS81LjAgKGlQaG9uZTsgQ1BVIGlQaG9uZSBPUyAxNl82IGxpa2UgTWFjIE9TIFgpIEFwcGxlV2ViS2l0LzYwNS4xLjE1IChLSFRNTCwgbGlrZSBHZWNrbykgVmVyc2lvbi8xNi42IE1vYmlsZS8xNUUxNDggU2FmYXJpLzYwNC4xIEVkZy8xMzAuMC4wLjA=",
  //   "method": "POST"
  // });

  const body2 = {
    p: 'chk_login',
    langx: 'zh-cn',
    ver: ver,
    username: username,
    password: password,
    app: 'N',
    auto: 'EICAAD',
    blackbox:
      '0400@ixVzIWcm@CVebKatfMjIDOg5mLCmMOfvPPtPD4qMkh8qkD0exQ0R02wa0tiH7upuZ5TMhOBRAY8V/rfihEZPZRvFCMSbl5xi@j/EsB67AoqauP3kCAMOGTmOqLA3SnRNfaGy@wKmtF4Qz3Cs6@yYtgrhLOsaydVW8ti0S17Mbyih2/27HARZd9HZxYpQdWs8VWo4o1/6JRFHyVF5@9K7uyYSxB9OqPIp8eEyxS8VvqbTcBtdNR@EZkTcSPtezlByApDqQR98wyqeH0OpGUadv6a@9aA@etanzlZKp9bEmwhN7hb4eJ4avgeiutxc9mETn3ScfrBfYQ19obL7Aqa0XhDPcKzr7Ji2CuEs6xrJ1Vby2LRLXsxvKKHb/bscBFl30dnFilB1azvUSbJ@Ltz3R3@1lLYqHZE0NVq2@Rz/T3tsM9ltPyKX92TL5tGQnomb@O5jfppV2@lIX@ZzrDnrFllSJpS7u3@tmA6a/ZVLuXO5bbqa1ZIVhRO4RA9puRdW/CToxSzv5adL/EbqkP@a0cjPr@IS1lrhZiojDYOGvNqnQBIdNiYRm8ZcEhxjnwrrUK9hS4ZWkwEyFy80Yih5Z5lLp2y3eUwcWvLjaktWoiOo6/BTgXkua3w4oOY6NQedPWovEZc9d8OScgjZ2DrowXojk4bF91PKPP7Ec@2O4THKtQyJ0pA90N13n2vmAeytJRmnJsVxcAILXKPYzpp/GO7P/zAA1mnWIkgtU19Wgzd0HwZFZsoI34Rvy8jU9/oxS9GTGQ/PXGUReO78f8dn4s//BPd61qfqLx0lxyJoIltSlvmbRKgOWcRvLGt/5UcaDjwEADjowE1Opss@2iAz14aHRGLwsrsEusQWSd5obNMRV0YmXEHAGKAO31T@YhItvz@T7bHfxZXqLz@1vlqUAr9dE2jcfl0lKNYpaK1iN3MEI3UUTmnb5oO7ycIyABeqIvdDnb4Zco0tE9dx3XHse0PoUYVsMEwrRZ1Nw@Dd31GASpJ6ETmLRJj7bhOxJDzfE7H/TDVL1E/yoVIBnjaisB2n/X/DCQnvsrYa7nViyCtYINXcJUm3xGpKxGRzy3myeAVsARqo4xHDo0vYYDC38rs3u50SOXcoF2qm4h/UZQSj1WSgXZQ/fCH@j0uJzm@YVEIS08I9cjXIj00GhUM5u6KD/Ap4zXwZpQRyqKemuJqTUnBSvUYsNwTidneZ5Wedvp3EOKiSx7uHGOjLfVqUWaUEcqinpriak1JwUr1GLDcE4nZ3meVnnb6dxDiokse7hxjoy31alFmlBHKop6a4ulGXILklDIVCbryu9G8AaTIauRtCQwBH1VKft@Y8hxZw5rNRhjMFvlSwejOX5dhKGYrsu13rc4R1YYITyzRwv8PXXpOa/Fh/ax3LxO6wXtzDRAaY/eQ7VuEMnibN2tQpOpNamMbgPUbzv/Wq4CfB@lYIw2zZSAghIFRGeX4@Xjnwa8doqzIkuwWZBamlGXoG1V86uBA@AcpBuHoK/L2C095VpgkQXTQzcUDSdGvQZJO2VaLJ9pv1mBQhdCka8OMcGFfXBnuF90tu6828R9GQm4rjPTHBnP/ukQgPzK/B9rQjsNn3NdYs7d@huI6Fw40k82cGDz2TnqsW6E5T7SjbTuqBCdF6UcylrGAqHKF92svmWFrOZ4B1Lp9xD6KYGuP2YbamY1MUAnGgiFKOsXcSILjFijINS9@MWCtJpkmxKJc/9EzqitIU7unBB@YOwhnBW5W0fT1RYFrtAop9ur3eOywb6ufBQksTe7J92Ykwts7Z1GHRtxUbfwR0AXiOOsg8vCRi3dQn6ozCtfe4SKCq48E/26HtWAF3evT/@wnS5Bs@OrQgNttqoskLcU/AxyKsMHmTi4yRFwifdjjw4wRMEqziBBkVbZqNPsSqUx@3IHXJ4pFUPALNCdim2mLqR1OssEJ96C56fOo90S7AbPnnf4WuGCdJ6sP0pxSY1DdVpEfcTtkQ9e89/9e/728hGV9pfLEMokGoGJxIpJQceGZLcSgYjhFIu8rPsQPcd6kSm4zHN0URjnyiUCW/40pM8u5mSAz6pKQhNLD9nXXyphcepAhU4PR@8Is4UNYqtbkyp9eD7aQHBB5wJUfay7znxv7zI1fOgOtdpg3BsGojDj9YfuhGsrLDqxlZecyMd5JmytOpOYTaSxESZgPznuuZ4TAPaXLUv7y@XcxOGN@L@9GuhP339N5k9rDGA3UhYXfdKDY4czXy12a@Xj6AlGJPY5ZoEWyzUcQuTeXXFuerLTC43FcfzU3KnpWEaPyakMvFSIAW7kfSM8lhYvHXG/jAQo0bHo5bQ04x53VARAtUOA5IlXtGIJX8DvqSxSt2WMYe@RgbBlTzHU/ER1zfWYs9eQC5xzQ3JibtA/ccO6hPPyzDU9LsfbCp2NFHCvGywcnx3ZrVqtngwsbSm/J75zoa@PIvtrVsehZ@MkBbc1x6dipnTsPyEXslq7z/8NTvJNUY9e3LBrvYqMlOrpCSOP8F/eyAHq/z1KcKTtqXfd8P8IRcr1TKEXPWXDnX6KCAEc9IaFe3T0I7uSmqz2B1zgRopF2Fq@R62Y2lnl1lfEpW@XqMo7OEuevr29xE2QQ7BnC97Z6/63aIRZb@39AudaF09Pqol9IOPAQggyB3iSu3htbofHvTNDM8jKDmUodOZ0e1WwB9trc5e@WyhHmlz6jSwYUXaXKBgWYjDL2pJsZX@KNPnMsQQaeu9R1rU8rxF30Ly9wSNkiEF9PZ6IxzVOGuDGokJB@ykTjcN5UDXI@@CWq6JOXEHvu84OnjjAWQGBukRrAuyiTVjrFUnp15zCoF0Dclm5md@LwPnC8fsLmuZvDKcd2KT4EIhFconQ@rlIMTewVhRJLGBGeFVM=;0400K6s@Dab1SY/jK9GFecOQi@yM9uTpeOclvxy0iyrajeiRIYbWxA9d9fBGIbaLXGUDTvOPWZZERxZ@99zTNwM6lY1KtGYeaD1enpJkimhbZiS0fStrvp8hmjCGQCDm@3xnn1vOt@XESqik25FrpLox4N36g5wKGuww8VWo4o1/6JQewkJFe4qUGeGRCOD/@f7Sp7lOnn2jJXA6vmMhoDXI5yRFidfbzH0/NNlLu696s3rBJODTFUBzlf6a@9aA@etanzlZKp9bEmwhN7hb4eJ4aoUagE0hLr02Tn3ScfrBfYSsDuuY9ZH8WhJdbZ7sTkl9Vhu/x5rsbS7SutwIwxcvY6gcxA4pTQAXkkovWMHc9uG4kGxltzkpNaqNTm538dVhZndwDJQOTJrvUSbJ@Ltz3R3@1lLYqHZE0NVq2@Rz/T3tsM9ltPyKX3UHzghRrLAQb@O5jfppV2@lIX@ZzrDnrFllSJpS7u3@tmA6a/ZVLuXO5bbqa1ZIVhRO4RA9puRdW/CToxSzv5adL/EbqkP@a0cjPr@IS1lrhZiojDYOGvNqnQBIdNiYRm8ZcEhxjnwrrUK9hS4ZWkwEyFy80Yih5Z5lLp2y3eUwcWvLjaktWoiOo6/BTgXkua3w4oOY6NQedGqYJRx4R5t01CkIv@mYS862rUhB@@MQAsEb5KdHtSVjk@7s9IeOl1L0DwLqNi4CgAt0n0e3Xki0lGacmxXFwMJx7HRqoQ9qJ7bCPSQ823Kn/ZjN/sPWSD@dIPZrty4ZedyPels7jcFlHVB6chrI7u8mR20/oWqfE9LST5p23mUwt6O60biHEp/zHesqjPHSKA75SqnFv74o110bIle@hQMkd6U89LMlyLUGV0m0WcpT/j3HsP3lK4iu6TAsPc3U5NAePLsfleEGZIIYlfN6@LKanxEVV2PsvFQ3SxgXyvTx/y4JwLTE4NiHx6YyfC5nS8rJRSOzkwJFaRYe7mA6xftSMTUV4SIyNBXjhjJdMKa@vK2OlpX/h8ngFbAEaqOMLD4mV3TQqnzvQvLMivTNJBByE0qFys4MJiDbCfVZTGBk19tyNs7g8/zTXiSaBbf1hoTF51bfP1/qyEJHiMpz05KZnXTUzdcstSVPrbgATwjJ1Okz2o91poMpuo0JeQGsoaHh7kteujGljzOC8rHfIxgF74x9JktQDKThVP1hAyCQqsH6hMgZ9x0R9vRNj5evLzdF6XhbUccUUA3pDXHzRR0J0Z3KrDBtMp15KDg/66MdEfb0TY@Xry83Rel4W1HHFFAN6Q1x80UdCdGdyqwwbTKdeSg4P@ujHRH29E2Pl68vN0XpeFtRxyCofHI9aHmKVfC7H5OBzPJr0SERa@T0bVPeImNr/UVPV6i8/tb5alAK/XRNo3H5dNOHjs7HO5CL//li8nYbsqLpi94ovlsN68Nne3GWGxBsGkgnVvJhnLTokpKH6zy0FykaEiBB3lJ75LkN1pnECcb3tXHW0biNyMTNMFyq7LHBSNfOTvsgtn8jOD/jjdG1bJnnhvo5dwP0TzEBdNLiXsNS5LoCa7Ohp94auk7waAOydW2I1dOcYZQ8STXLOO25/7eOYKpDDGGHQBWWLTqbaMYoyZWXoBiDDNQeGwCeB4LeJP@uJSqKjN8A6K3HjRQPNi/w5rk2aLUUb9DdoXF5Bq6Q2sBcS9tbDshq5G0JDAEfRou0PT5aseVLrByVovu/@n8psKE4QnpndJ37dxBDm5A2CR8F/UVVN4uiJKm1VlOOXjEMuEsdlXF3a/MVWSKOVC41F1YkC/9GXQeIu0rYNbp5QriwQnrlIaT6WVVS27OKoI@9uLBHBOOghWwLOr/Ln2x7W1gtmfVBQaXsP5EHcplVvfIGjwGQOe48FvMboXnQoa0fCCbiWg4YkuMtBROWNFQW1PThYuTjZfHycBD/YEqAbgsspId@VuKUvwrQEckl0HPty63HLm6s6wsUVjjEacJSle4L0Q0iSwV9m9mdgtTl0UTaSKIaSuqGueuY3v0E0RIcZLJBvkQliiJRuK@W3Wb@tMOhdb6fjB1w4yyPAdZri73AAaNQDOt74G6sc2kicvttnD1@LSnvTNDM8jKDmXYpPgQiEVyidD6uUgxN7BXzBngSaW/U1rFt29Nm9E0wSuOCSs63ilVYZF4bWLk5VmEODqcSmwlKrCq2SH5g9qu7HLiS6doU17mCt@Nu5QXfmtj/bWI/vrNGhMKdq7El8AFmri0HluWMgCi/IUYfrFlJr/aZPlgyFnzsBpWgGbFlnh2H4Fnt5h3uqMGG5iucqd1mMYYV0atwHgoyK2DF/Lm3Y6dFgbRNbCd5VPt04yqbB5@fSyAQmdvqOIDef8x1TVh0E5P965GPJkHxak9vqvAGfpQ@mlukTLLmWoLaJUb9It7t4FqmX1tbp6VVnlbD1TIttHBSb46LbUyNsg3SDJ8823HdqRC5dkntGuXTRSGWF8vY637DtjoPopgvFjUlWimaEO2YyJeoKVSQIQXQOExOpTNYOmHAV7e4tYmvRksWdQ78YTl2t38HYYNdyOmCGfSCVHZYDAPbiQVaBlYkVluaujyQYh1ABEECTCFB@sKclXpbQ1LUOTfy1A7mS5ay6DWAbaglId/KL27Hdz7T9DhYYLOSfaT2c4KzsiCoeRXpaHN5mATvLuNelmF8UU7XD0E10EM6hz5ddV7BuuV0sHdb3G2atTNrn4IIbkh1t7v5iyFl2iJXaUozZjTllbdaqFANXEDBrQiSNRMlbklSdDY3NjGqQTqMPQV8E/zeQn29DlXg4AuCctk=',
    userAgent:
      'TW96aWxsYS81LjAgKGlQaG9uZTsgQ1BVIGlQaG9uZSBPUyAxNl82IGxpa2UgTWFjIE9TIFgpIEFwcGxlV2ViS2l0LzYwNS4xLjE1IChLSFRNTCwgbGlrZSBHZWNrbykgVmVyc2lvbi8xNi42IE1vYmlsZS8xNUUxNDggU2FmYXJpLzYwNC4xIEVkZy8xMzAuMC4wLjA=',
  };
  const res2 = await cuFetch(`${url}/transform.php?ver=${ver}`, {
    headers: {
      accept: '*/*',
      'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      cookie:
        'CookieChk=WQ==; protocolstr=aHR0cHM=; cuipv6=WQ==; cu=WQ==; ipv6=WQ==; test=aW5pdA; login_35838222=MTcyODMwMDk5NQ',
      Referer: 'https://m172.mos077.com/',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
    body: objToFormData(body2),
    method: 'POST',
  });
  const text2 = await res2.text();
  const mixObj = Convert.xml2js(text2, { compact: true }) as any;
  const uid = mixObj?.serverresponse?.uid?._text as string;
  const _username = mixObj?.serverresponse?.username?._text;
  if (!_username) {
    throw Error('loginByAccount chk_login失败');
  }
  const body3 = {
    p: 'check_login_domain',
    ver: ver,
    username: _username,
    uid: uid,
    langx: 'zh-cn',
    code: 663,
  };

  const res3 = await cuFetch(`${url}/transform.php?ver=${ver}`, {
    method: 'post',
    headers: {
      accept: '*/*',
      'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      cookie:
        'CookieChk=WQ==; protocolstr=aHR0cHM=; cuipv6=WQ==; cu=WQ==; ipv6=WQ==; test=aW5pdA; login_35838222=MTcyODMwMDk5NQ',
      Referer: 'https://m172.mos077.com/',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
    body: objToFormData(body3),
  });
  const text3 = await res3.text();
  const mixObj3 = Convert.xml2js(text3, { compact: true }) as any;
  const domain = mixObj3?.serverresponse?.new_domain?._text || 'no';
  return {
    uid,
    ver,
    url: `https://${domain === 'no' ? url.slice(8) : domain}/`,
  };
}
