import { updateFootballStateFromOss, updateFootballStateFromWeb, uploadFootballStateToOss } from '../store/football.js';

(async () => {
  await updateFootballStateFromOss();
  setInterval(async () => {
    await updateFootballStateFromWeb();
  }, 3000);
  setInterval(async () => {
    try {
      await uploadFootballStateToOss();
    } catch (error) {}
  }, 5000);
})();
