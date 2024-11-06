import { updateFootballStateFromWeb, updateFootballStateToOss } from "src/store/football.js";
import  '../http/index.js';

(async () => {
  setInterval(async () => {
    updateFootballStateFromWeb()
  }, 1000);
})();