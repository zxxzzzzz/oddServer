import restify from 'restify';
import path from 'path';

// 创建一个 restify 服务器实例
const server = restify.createServer();

// 设置监听端口
server.listen(80, function () {
  console.log('%s listening at %s', server.name, server.url);
});
server.get(
  '/*', // don't forget the `/*`
  restify.plugins.serveStaticFiles('./web')
);
export { server };
