import * as cookie from 'cookie';
import { getAccountBySessionId } from '../store/user.ts';
import { existsSync, writeFileSync } from 'fs';
import { getLogFilePath } from '../utils/index.ts';
import dayjs from 'dayjs';
import { Application } from '@oak/oak/application';
import { router } from './router.ts';


const app = new Application();

app.use(async (context, next) => {
  try {
    await context.send({
      root: `${Deno.cwd()}/web/web_2024_12`,
      index: 'index.html',
    });
  } catch {
    await next();
  }
});

app.use(async (ctx, next) => {
  const startTime = Date.now();
  await next();
  const cookieObj = cookie.parse(ctx.request.headers.get('cookie') || '');
  const filePath = getLogFilePath('http');
  const userInfo = await getAccountBySessionId(cookieObj?.session_id || '');
  const account = userInfo?.account || '';
  if (!existsSync(filePath)) {
    writeFileSync(filePath, `date, account, url, duration\n`, { encoding: 'utf-8' });
  }
  const duration = new Date().valueOf() - startTime;
  writeFileSync(
    filePath,
    `${dayjs().format('YYYY-MM-DD HH:mm:ss')}, ${account}, ${(ctx.request.url.pathname || '').replace(/,/g, '，')}, ${duration}\n`,
    {
      flag: 'a',
      encoding: 'utf-8',
    }
  );
});

// server.on('after', async (req: restify.Request, _res, _route, _error) => {
// });

// server.get(
//   '/*', // don't forget the `/*`
//   restify.plugins.serveStaticFiles()
// );
app.use(router.routes());
app.use(router.allowedMethods());

export { app };
