"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var httpProxy = require("http-proxy");
function get(options) {
    var targetAcquisition = (options && options.targetAcquisition ? options.targetAcquisition : null);
    if (!targetAcquisition)
        throw "bad target acquisition callback function";
    var proxy = httpProxy.createProxyServer();
    var middleware = function (req, res) {
        targetAcquisition(req) // acquire the proxy target
            .then(function (settings) {
            var opt = {
                target: settings.targetUrl,
                changeOrigin: true // change the 'host' header field to target host
                ,
                xfwd: (options && typeof options.xfwd === "boolean" ? options.xfwd : false)
            };
            if (typeof settings.rejectUnauthorized === 'boolean')
                opt.secure = settings.rejectUnauthorized;
            proxy.web(req, res, opt);
        }).catch(function (err) {
            res.status(500).json({ err: err });
        });
    };
    var p = proxy;
    return { middleware: middleware, proxy: p };
}
exports.get = get;
//# sourceMappingURL=index.js.map