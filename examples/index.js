import sourceMapSupport from 'source-map-support';
sourceMapSupport.install();
import * as globals from './server/globals.js';
import express from 'express';
import * as http from 'http';
import { startLR } from './server/util.js';
const app = express();
const server = http.createServer({}, app);
if (globals.isDev) {
    app.set('json spaces', 2);
    if (globals.isLR) {
        startLR(app, globals.outDir);
    }
}
app.use(express.static(globals.outDir));
app.use(express.json());
process.on('SIGTERM', async () => {
    console.log('Process TERMed');
    process.exit();
});
async function start() {
    console.log('Starting Server');
    server.listen(globals.port, () => {
        const msg = JSON.stringify(globals.config, null, 2);
        const protocol = 'http';
        console.log(`[server]: Server is running at ${protocol}://localhost:${globals.port}\n\nCONFIG:\n\n${msg}`);
    });
}
start();
//# sourceMappingURL=index.js.map