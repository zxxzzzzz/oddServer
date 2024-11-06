import { updateFootballStateFromOss } from 'src/store/football.js';
import  '../http/index.js';

(()=>{
  setInterval(async () => {
    updateFootballStateFromOss()
    // await updateJCInfoList();
    // await updateHGInfoList({ limitMatchCount: 5 });
    // await updateToOss()
  }, 10000);
})()