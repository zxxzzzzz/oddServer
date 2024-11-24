import {
  updateJCInfoList,
  saveFootballState,
  GlobalFootballState,
  updateAllHGLeagueList,
  updateHGGameList,
  updateHgInfoList,
} from '../store/football';
import { updateTokenIdleAge } from '../store/hgAccount';
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
      await updateHgInfoList();
      logInfo()
      saveFootballState();
      updateTokenIdleAge()
    },
    1,
    false
  );
})();
