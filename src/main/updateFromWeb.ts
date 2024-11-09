import { updateFootballStateFromWeb, uploadFootballStateToOss } from '../store/football.js';
import os from 'os';


(async () => {
  setInterval(async () => {
    await updateFootballStateFromWeb();
  }, 3000);
  setInterval(async () => {
    try {
      await uploadFootballStateToOss({ isInternal: os.type() === 'Linux' ? true :false });
    } catch (error) {}
  }, 5000);
})();
