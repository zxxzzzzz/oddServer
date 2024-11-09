import { saveFootballStateToCache, updateFootballStateFromOss } from '../store/football.js';
import '../http/index.js';
import os from 'os';

(() => {
  setInterval(async () => {
    try {
      await updateFootballStateFromOss({ isInternal: os.type() === 'Linux' ? true :false });
      saveFootballStateToCache()
    } catch (error) {}
    // await updateJCInfoList();
    // await updateHGInfoList({ limitMatchCount: 5 });
    // await updateToOss()
  }, 5000);
})();
