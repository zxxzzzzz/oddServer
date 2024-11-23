import { updateFootballStateFromWeb, saveFootballState, loadFootballState } from '../store/football';
(async () => {
  loadFootballState();
  setInterval(async () => {
    await updateFootballStateFromWeb();
    saveFootballState();
  }, 3000);
})();
