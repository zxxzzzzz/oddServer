import restify from "restify";
const server = restify.createServer();
server.listen(80, function () {
    console.log("%s listening at %s", server.name, server.url);
});
server.use(restify.plugins.bodyParser());
server.get("/*", (req, res, next) => {
    restify.plugins.serveStaticFiles("./web")(req, res, () => { });
});
export { server };
