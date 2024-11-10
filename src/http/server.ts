import restify from 'restify';
import * as cookie from 'cookie';
import { getAccountBySessionId } from '../store/user.js';
import dayjs from 'dayjs';
import path from 'path';
import { existsSync, statSync, writeFileSync } from 'fs';
import { range } from '../utils/lodash.js';

// 创建一个 restify 服务器实例
const server = restify.createServer();

// 设置监听端口
server.listen(80, function () {
  console.log('%s listening at %s', server.name, server.url);
});

server.use(restify.plugins.bodyParser());
server.use(restify.plugins.queryParser());

server.on('after', async (req: restify.Request, res, route, error) => {
  let filePath = range(0, 100)
    .map((i) => {
      return path.resolve(import.meta.dirname, `../../log/http-${dayjs().format('YYYY-MM-DD')}-p${i}.csv`);
    })
    .find((filePath) => {
      if (!existsSync(filePath)) return true;
      if (statSync(filePath).size / 1024 / 1024 < 10) return true;
      return false;
    });
  if (!filePath) {
    filePath = path.resolve(import.meta.dirname, `../../log/http-${dayjs().format('YYYY-MM-DD')}-p101.csv`);
  }
  const startTime = req.time();
  const cookieObj = cookie.parse(req.header('cookie'));
  const userInfo = await getAccountBySessionId(cookieObj?.session_id || '');
  const account = userInfo?.account || req.body?.account || '';
  const ip = req.socket.remoteAddress || '';
  if (!existsSync(filePath)) {
    writeFileSync(filePath, `date, account, ip, url, duration\n`, { encoding: 'utf-8' });
  }
  const duration = new Date().valueOf() - startTime;
  writeFileSync(filePath, `${new Date().toISOString()}, ${account}, ${ip}, ${(req.url || '').replace(/,/g, '，')}, ${duration}\n`, {
    flag: 'a',
    encoding: 'utf-8',
  });
});

server.get(
  '/*', // don't forget the `/*`
  (req, res, next) => {
    restify.plugins.serveStaticFiles('./web')(req, res, () => {});
  }
);

export { server };
