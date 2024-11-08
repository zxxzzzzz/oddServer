import { updateFootballStateFromWeb, updateFootballStateToOss } from "../store/football.js";
(async () => {
    setInterval(async () => {
        updateFootballStateFromWeb();
    }, 1000);
    setInterval(async () => {
        updateFootballStateToOss({ isInternal: true });
    }, 10000);
})();
