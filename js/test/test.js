"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var bodyParser = require("body-parser");
var httpProxy = require("../");
// API server setup
/////////////////////////////////////////////////////////////////////////////////
var app = express();
app.use(bodyParser.text({ "limit": "999mb" }));
app.use(bodyParser.json({ "limit": "999mb" }));
// no caching
app.use(function (req, res, next) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next();
});
app.use(function (req, res, next) {
    console.log("\n<<API server>>: path=" + req.path + ", method=" + req.method + ", header=" + JSON.stringify(req.headers));
    next();
});
app.get("/services/hello", function (req, res) {
    res.jsonp({ msg: "Hawdy" });
});
var port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log("API server listening on port " + port + " :-)");
});
/////////////////////////////////////////////////////////////////////////////////
// proxy server setup
/////////////////////////////////////////////////////////////////////////////////
var appProxy = express();
var proxyRet = httpProxy.get({
    targetAcquisition: function (req) { return Promise.resolve({ targetUrl: "http://127.0.0.1:" + port + "/services" }); },
    xfwd: true // turn on the x-forwarded-{xxx} headers
});
proxyRet.proxy.on("error", function (err) {
    console.error("!!! Error: " + JSON.stringify(err));
}).on("proxyReq", function (proxyReq, req) {
    console.log("\n<<proxyReq>>, req.url=" + req.url);
    proxyReq.removeHeader("authorization");
}).on("proxyRes", function (proxyRes, req, res) {
    console.log("\n<<proxyRes>>, proxyRes.headers=" + JSON.stringify(proxyRes.headers));
});
appProxy.use("/services", proxyRet.middleware);
var portProxy = 3001;
appProxy.listen(portProxy, function () {
    console.log("Proxy server listening on port " + portProxy + " :-)");
});
/////////////////////////////////////////////////////////////////////////////////
// TODO: try to run this test with the following curl command:
// curl -H "Authorization: Bearer fdaidwqeriuehrtqgxbvdlkfjambvjknhggvbevbib" http://127.0.0.1:3001/services/hello
//# sourceMappingURL=test.js.map