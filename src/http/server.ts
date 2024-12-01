import restify from 'restify';
import * as cookie from 'cookie';
import { getAccountBySessionId } from '../store/user';
import { existsSync, writeFileSync } from 'fs';
import { getLogFilePath } from '../utils/index';

// 创建一个 restify 服务器实例
const server = restify.createServer();

// 设置监听端口
server.listen(80, function () {
  console.log('%s listening at %s', server.name, server.url);
});

server.use(restify.plugins.bodyParser());
server.use(restify.plugins.queryParser());
server.use(restify.plugins.gzipResponse());

server.on('after', async (req: restify.Request, res, route, error) => {
  const filePath = getLogFilePath('http');
  const startTime = req.time();
  const cookieObj = req.header('cookie') ? cookie.parse(req.header('cookie')) : {};
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
    restify.plugins.serveStaticFiles('./web/web_2024_12')(req, res, () => {});
  }
);

export { server };
