import app from './load-app.mjs'
import Repository from './utils/ea-repo.mjs'
import fsAsync from 'fs/promises'

process.env.API_PORT = process.env.API_PORT ?? 8080;


async function queryOnStart() {
}

//queryOnStart();

//throw Error('environment variable API_PORT not set');
let server = app.listen(process.env.API_PORT, () => {
    console.log(`Start listen on port ${process.env.API_PORT}`)
})

process.on('SIGINT', () => {
    console.log(`Stop listen and exit`);
    server.close();
})
