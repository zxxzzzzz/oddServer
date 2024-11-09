// 运维接口
import path from 'path';
import { getAliveUrl } from '../store/hgAccount.js';
import { server } from './server.js';
import { execSync } from 'child_process';
import dayjs from 'dayjs';
import { existsSync, readFileSync } from 'fs';

function getDataServerState() {
  const filePath = path.resolve(import.meta.dirname, `../../cache/requestPerformance-${dayjs().format('YYYY-MM-DD')}.csv`);
  if (!existsSync(filePath)) {
    return { state: 'stop' };
  }
  const lineList = readFileSync(filePath, { encoding: 'utf-8' }).split('\n');
  const hasDataLog = lineList.slice(-100).some((line) => {
    const [date, tag] = line.split(',');
    if (tag.trim() === 'getToken' && new Date().valueOf() - new Date(date).valueOf() < 1000 * 60 * 2) return true;
  });
  const stdout = execSync('pm2 list').toString('utf-8');
  const hasServerExist = stdout.includes('data');
  if (hasDataLog && hasServerExist) {
    return { state: 'running' };
  }
  return { state: 'stop' };
}

// 开启数据服务
server.get('/api/om/start', (req, res, next) => {
  const state = getDataServerState();
  if (state.state === 'running') {
    res.send({ success: false, message: '服务正在运行,无需再启动' });
    next();
    return;
  }
  execSync('npm run data', { windowsHide: true });
  res.send({ success: true, message: '服务启动成功' });
  next();
});

// 开启数据服务状态
server.get('/api/om/state', (req, res, next) => {
  const state = getDataServerState();
  res.send({ success: true, data: state });
  next();
});

// hg连接状态
server.get('/api/om/hgState', async (req, res) => {
  const url = await getAliveUrl();
  res.send({ success: true, data: { canConnect: !!url } });
  return true;
});
