import { delay } from '../api/utils';
import {
  updateJCInfoList,
  saveFootballState,
  loadFootballState,
  GlobalFootballState,
  updateAllHGLeagueList,
  updateHGGameList,
  updateHgInfoList,
} from '../store/football';
import { executeSequentialIntervals } from '../utils';
(async () => {
  const logInfo = () => {
    console.log({
      jcInfoLen: GlobalFootballState.JCInfoList.length,
      hgLeagueListLen: GlobalFootballState.HGLeagueList.length,
      hgGameListLen: GlobalFootballState.HGGameList.length,
      filterHgGameListLen: GlobalFootballState.filteredHGGameList.length,
      hgInfoLen: GlobalFootballState.HGInfoList.length,
    });
  };
  await updateJCInfoList();
  logInfo();
  await updateAllHGLeagueList();
  logInfo();
  await updateHGGameList();
  logInfo();
  await updateHgInfoList();
  saveFootballState();
  logInfo();

  executeSequentialIntervals(
    async () => {
      await updateJCInfoList();
      saveFootballState();
    },
    1000 * 10,
    false
  );

  executeSequentialIntervals(
    async () => {
      await updateAllHGLeagueList();
      saveFootballState();
    },
    1000 * 60 * 5,
    false
  );

  executeSequentialIntervals(
    async () => {
      await updateHGGameList();
      saveFootballState();
    },
    1000 * 60 * 5,
    false
  );

  executeSequentialIntervals(
    async () => {
      const v1 = new Date().valueOf();
      await updateHgInfoList();
      console.log('hgUpdate', (new Date().valueOf() - v1) / 1000, 's');
      saveFootballState();
    },
    1,
    false
  );
})();
