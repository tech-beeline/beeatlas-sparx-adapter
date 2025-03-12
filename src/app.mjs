import { bootstrapAPI } from './api/bootstrap.mjs';
import app from './index.mjs'

process.env.API_PORT = process.env.API_PORT ?? 8080;


async function queryOnStart() {
   
}

//queryOnStart();

async function start() {
    await bootstrapAPI.init();

    let server = app.listen(process.env.API_PORT, () => {
        console.log(`Start listen on port ${process.env.API_PORT}`)
    })

    process.on('SIGINT', () => {
        console.log(`Stop listen and exit`);
        server.close();
    })
}

start();

