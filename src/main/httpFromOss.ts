import { updateFootballStateFromOss } from '../store/football.js';
import  '../http/index.js';

(()=>{
  setInterval(async () => {
    updateFootballStateFromOss({isInternal:true})
    // await updateJCInfoList();
    // await updateHGInfoList({ limitMatchCount: 5 });
    // await updateToOss()
  }, 10000);
})()