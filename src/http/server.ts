// @deno-types="npm:@types/restify"
import restify from 'restify';
import * as cookie from 'cookie';
import { getAccountBySessionId } from '../store/user.ts';
import { existsSync, writeFileSync } from 'fs';
import { getLogFilePath } from '../utils/index.ts';
import dayjs from 'dayjs';
import { parseArgs } from '@std/cli/parse-args';
const cliArgs = parseArgs(Deno.args);

// 创建一个 restify 服务器实例
const server = restify.createServer();

// 设置监听端口
server.listen(cliArgs.port || 80, function () {
  console.log('%s listening at %s', server.name, server.url);
});

server.use(restify.plugins.bodyParser());
server.use(restify.plugins.queryParser());
server.use(restify.plugins.gzipResponse());

server.on('after', async (req: restify.Request, _res, _route, _error) => {
  const filePath = getLogFilePath('http');
  const startTime = req.time();
  const cookieObj = req.header('cookie') ? cookie.parse(req.header('cookie')) : {};
  const userInfo = await getAccountBySessionId(cookieObj?.session_id || '');
  const account = userInfo?.account || req.body?.account || '';
  if (!existsSync(filePath)) {
    writeFileSync(filePath, `date, account, url, duration\n`, { encoding: 'utf-8' });
  }
  const duration = new Date().valueOf() - startTime;
  writeFileSync(filePath, `${dayjs().format('YYYY-MM-DD HH:mm:ss')}, ${account}, ${(req.url || '').replace(/,/g, '，')}, ${duration}\n`, {
    flag: 'a',
    encoding: 'utf-8',
  });
});

server.get(
  '/*', // don't forget the `/*`
  restify.plugins.serveStaticFiles('./web/web_2024_12')
);

export { server };
