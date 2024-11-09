import { updateFootballStateFromWeb, uploadFootballStateToOss } from '../store/football.js';

(async () => {
  setInterval(async () => {
    await updateFootballStateFromWeb();
  }, 3000);
  setInterval(async () => {
    try {
      await uploadFootballStateToOss({ isInternal: false });
    } catch (error) {}
  }, 5000);
})();
