import { toAsyncTimeFunction, toFifoFunction } from './utils/index.js';
import { delay } from './api/utils.js';
(async () => {
    const t1 = toFifoFunction(toAsyncTimeFunction(async (n, i) => {
        await delay(n);
        console.log(i);
    }, 'test'));
    t1(1000, 1);
    t1(300, 2);
    t1(500, 3);
})();
