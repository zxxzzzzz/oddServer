import restify from "restify";

// 创建一个 restify 服务器实例
const server = restify.createServer();

// 设置监听端口
server.listen(80, function () {
  console.log("%s listening at %s", server.name, server.url);
});


server.use(restify.plugins.bodyParser())

server.get(
  "/*", // don't forget the `/*`
  (req, res, next) => {
    restify.plugins.serveStaticFiles("./web")(req, res, () => { });
  }
);

export { server };
