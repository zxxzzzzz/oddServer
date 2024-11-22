import { resolve } from 'path';
import { server } from './server.js';
import { writeFileSync } from 'fs';
import { GlobalFootballState } from 'src/store/football.js';

server.post('/sync/footballState', async (req, res) => {
  const body = req.body;
  GlobalFootballState.HGInfoList = body?.HGInfoList || [];
  GlobalFootballState.JCInfoList = body?.JCInfoList || [];
  res.send({ code: 200 });
});
