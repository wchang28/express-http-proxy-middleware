/// <reference types="express" />
/// <reference types="node" />
/// <reference types="http-proxy" />
import * as http from 'http';
import * as express from 'express';
import * as httpProxy from 'http-proxy';
import * as url from "url";
export { ServerOptions } from 'http-proxy';
export interface TargetSettings {
    targetUrl: string;
    rejectUnauthorized?: boolean;
}
export declare type TargetAcquisition = (req: express.Request) => Promise<TargetSettings>;
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
export declare function get(options: Options): ProxyReturn;
