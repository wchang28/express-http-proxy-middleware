import * as http from 'http';
import * as express from 'express';
import * as httpProxy from 'http-proxy';
import * as events from 'events';
import * as url from "url";

export {ServerOptions} from 'http-proxy';

export interface TargetSettings {
    targetUrl: string;
    rejectUnauthorized?: boolean;
}

export type TargetAcquisition = (req: express.Request) => Promise<TargetSettings>;

export interface Options {
    targetAcquisition: TargetAcquisition;
    xfwd?: boolean;
}

export interface IProxyEventEmitter {
    on(event: "error", listener: (err: any, req: express.Request, res: express.Response, target?: string | url.Url) => void): this;
    on(event: "proxyReq", listener: (proxyReq: http.ClientRequest, req: express.Request, res: express.Response, options: httpProxy.ServerOptions) => void): this;
    on(event: "proxyRes", listener: (proxyRes: http.IncomingMessage, req: express.Request, res: express.Response) => void): this;
}

export interface ProxyReturn {
    middleware: express.RequestHandler;
    proxy: IProxyEventEmitter;
}

export function get(options: Options) : ProxyReturn {
    let targetAcquisition: TargetAcquisition = (options && options.targetAcquisition ? options.targetAcquisition : null);
    if (!targetAcquisition) throw "bad target acquisition callback function";
    let proxy = httpProxy.createProxyServer();
    let middleware = (req: express.Request, res: express.Response) => {
        targetAcquisition(req)  // acquire the proxy target
        .then((settings: TargetSettings) => {
            let opt: httpProxy.ServerOptions = {
                target: settings.targetUrl
                ,changeOrigin: true    // change the 'host' header field to target host
                ,xfwd: (options && typeof options.xfwd === "boolean" ? options.xfwd : false)
            };
            if (typeof settings.rejectUnauthorized === 'boolean') opt.secure = settings.rejectUnauthorized;
            proxy.web(req, res, opt);
        }).catch((err: any) => {
            res.status(500).json({err});
        });
    };
    let p: any = proxy;
    return {middleware, proxy: p};
}