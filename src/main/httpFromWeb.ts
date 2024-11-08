import { updateFootballStateFromWeb, updateFootballStateToOss } from '../store/football.js';
import '../http/index.js';

(async () => {
  setInterval(async () => {
    await updateFootballStateFromWeb();
    updateFootballStateToOss({ isInternal: true });
  }, 3000);
})();
