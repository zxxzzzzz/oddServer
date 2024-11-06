import restify from "restify";
import { getAccountBySessionId } from "src/store/user.js";
import * as cookie from "cookie";

// 创建一个 restify 服务器实例
const server = restify.createServer();

// 设置监听端口
server.listen(80, function () {
  console.log("%s listening at %s", server.name, server.url);
});

server.use((req, res, next) => {
  if (req.url === "/") {
    next();
    return;
  }
  const isStatic =
    /^\/(?:[^?#]*\.(?:html|css|js|png|jpg|jpeg|gif|svg|ico|ttf|woff|woff2|eot))(?:\?.*)?$/.test(
      req.url || ""
    );
  if (isStatic) {
    next();
    return;
  }
  const cookieStr = req.header("cookie") || "";
  const cookieObj = cookie.parse(cookieStr);
  if (!cookieObj?.session_id) {
    next(Error("请重新登录"));
    return;
  }
  const account = getAccountBySessionId(cookieObj.session_id);
  if (!account) {
    next(Error("请重新登录" + req.url));
    return;
  }
  next();
});
server.get(
  "/*", // don't forget the `/*`
  (req, res, next) => {
    restify.plugins.serveStaticFiles("./web")(req, res, () => {});
  }
);

export { server };
