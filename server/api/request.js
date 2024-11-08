import { delay } from './utils.js';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
export const cuFetch = async (...params) => {
    let _error = Error('');
    for (let index = 0; index < 3; index++) {
        try {
            const res = await fetch(...params);
            return res;
        }
        catch (error) {
            _error = error;
            await delay(2000);
        }
    }
    throw _error;
};
