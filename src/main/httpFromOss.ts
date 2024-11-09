import { updateFootballStateFromOss } from '../store/football.js';
import '../http/index.js';


(() => {
  setInterval(async () => {
    try {
      await updateFootballStateFromOss();
    } catch (error) {}
    // await updateJCInfoList();
    // await updateHGInfoList({ limitMatchCount: 5 });
    // await updateToOss()
  }, 5000);
})();
