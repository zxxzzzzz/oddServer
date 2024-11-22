import { syncFootballState, updateFootballStateFromWeb, saveFootballState } from '../store/football.js';

(async () => {
  // await updateFootballStateFromOss();
  setInterval(async () => {
    await updateFootballStateFromWeb();
    saveFootballState()
    // syncFootballState()
  }, 3000);
})();
