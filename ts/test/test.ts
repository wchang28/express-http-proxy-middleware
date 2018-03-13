import * as express from "express";
import * as bodyParser from "body-parser";
import * as http from 'http';
import * as httpProxy from "../";

// API server setup
/////////////////////////////////////////////////////////////////////////////////
let app = express();

app.use(bodyParser.text({"limit":"999mb"}));
app.use(bodyParser.json({"limit":"999mb"}));

// no caching
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
	res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
	res.header('Expires', '-1');
	res.header('Pragma', 'no-cache');
	next();
});

app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.log(`\n<<API server>>: path=${req.path}, method=${req.method}, header=${JSON.stringify(req.headers)}`);
    next();
});

app.get("/services/hello", (req: express.Request, res: express.Response) => {
    res.jsonp({msg: "Hawdy"});
});

let port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`API server listening on port ${port} :-)`);
});
/////////////////////////////////////////////////////////////////////////////////

// proxy server setup
/////////////////////////////////////////////////////////////////////////////////
let appProxy = express();

let proxyRet = httpProxy.get({
    targetAcquisition: (req: express.Request) => Promise.resolve<httpProxy.TargetSettings>({targetUrl: `http://127.0.0.1:${port}/services`})
    ,xfwd: true // turn on the x-forwarded-{xxx} headers
});

proxyRet.proxy.on("error", (err: any) => {
    console.log(`!!! Error: ${JSON.stringify(err)}`);
}).on("proxyReq", (proxyReq: http.ClientRequest, req: express.Request) => {
    console.log(`\n<<proxyReq>>, req.url=${req.url}`);
    proxyReq.removeHeader("authorization");
}).on("proxyRes", (proxyRes: http.IncomingMessage, req: express.Request, res: express.Response) => {
    console.log(`\n<<proxyRes>>, proxyRes.headers=${JSON.stringify(proxyRes.headers)}`);
});

appProxy.use("/services", proxyRet.middleware);

let portProxy = 3001;
appProxy.listen(portProxy, () => {
    console.log(`Proxy server listening on port ${portProxy} :-)`);
});
/////////////////////////////////////////////////////////////////////////////////

// TODO: try to run this test with the following curl command:
// curl -H "Authorization: Bearer fdaidwqeriuehrtqgxbvdlkfjambvjknhggvbevbib" http://127.0.0.1:3001/services/hello