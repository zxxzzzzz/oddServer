// 运维接口
import path from 'path';
import { getAliveUrl } from '../store/hgAccount';
import { server } from './server';
import { execSync } from 'child_process';
import dayjs from 'dayjs';
import { existsSync, readFileSync, statSync } from 'fs';
import { range } from '../utils/index';

function getDataServerState() {
  let filePath = range(0, 100)
    .map((i) => {
      return path.resolve(__dirname, `../../log/performance-${dayjs().format('YYYY-MM-DD')}-p${i}.csv`);
    })
    .reverse()
    .find((filePath) => {
      if (existsSync(filePath)) return true;
      return false;
    });
  if (!filePath) {
    filePath = path.resolve(__dirname, `../../log/performance-${dayjs().format('YYYY-MM-DD')}-p101.csv`);
  }
  if (!existsSync(filePath)) {
    return { state: 'stop' };
  }
  const lineList = readFileSync(filePath, { encoding: 'utf-8' }).split('\n');
  const hasDataLog = lineList.slice(-100).some((line) => {
    if (!line) return false;
    const [date, tag] = line.split(',');
    if (!tag) return;
    if (tag.trim() === 'getToken' && new Date().valueOf() - new Date(date).valueOf() < 1000 * 60 * 2) return true;
  });
  const stdout = execSync('pm2 list').toString('utf-8');
  const hasServerExist = stdout.split('\n').some((line) => line.includes('data') && line.includes('online'));
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
