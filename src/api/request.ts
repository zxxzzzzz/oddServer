import { errorLog } from '../utils';
import { delay } from './utils';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export const cuFetch = async (...params: Parameters<typeof fetch>) => {
  await delay(100);
  let _error = Error('');
  for (let index = 0; index < 9; index++) {
    try {
      const res = await fetch(...params);
      return res;
    } catch (error) {
      _error = error as Error;
      await delay(1000 * 2);
      console.log('retry', params[0]);
    }
  }
  errorLog((_error as Error).message);
};
// export const cuFetch = async (...params: Parameters<typeof fetch>) => {
//   let _error = Error('');
//   for (let index = 0; index < 3; index++) {
//     try {
//       console.log(params[0], index);
//       const url = params[0] as string;
//       const body = params[1]?.body as any;
//       const headers = params[1]?.headers as any;

//       if (params[1]?.method?.toLowerCase() === 'post') {
//         const res = await axios.post(url, body, { headers });
//         const data = typeof res.data === 'string' ? res.data : JSON.stringify(res.data)
//         return { text: () => Promise.resolve(data) };
//       }
//       if (params[1]?.method?.toLowerCase() === 'get') {
//         const res = await axios.get(url, { headers });
//         const data = typeof res.data === 'string' ? res.data : JSON.stringify(res.data)
//         return { text: () => Promise.resolve(data) };
//       }
//       const res = await axios.get(url, { headers });
//       const data = typeof res.data === 'string' ? res.data : JSON.stringify(res.data)
//       console.log(data);
//       return { text: () => Promise.resolve(data) };
//     } catch (error) {
//       _error = error as Error;
//       await delay(2000);
//     }
//   }
//   throw _error;
// };
