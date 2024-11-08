import { updateFootballStateFromOss } from '../store/football.js';
import '../http/index.js';
(() => {
    setInterval(async () => {
        updateFootballStateFromOss({ isInternal: true });
    }, 10000);
})();
