import { updateFootballStateFromWeb, updateFootballStateToOss } from "src/store/football.js";

(async () => {
  setInterval(async () => {
    updateFootballStateFromWeb()
  }, 1000);
  setInterval(async () => {
    updateFootballStateToOss()
  }, 10000);
})();