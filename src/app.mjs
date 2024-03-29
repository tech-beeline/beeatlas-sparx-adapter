import { YAMLMap } from 'yaml';
import app from './load-app.mjs'
import Repository from './utils/ea-repo.mjs'
import fsAsync from 'fs/promises'

process.env.API_PORT = process.env.API_PORT??8080;


async function  queryOnStart(){
    let tt = await Repository.queryRows( "select * from t_snapshot    where position=44525057")
    await fsAsync.writeFile( './dump/bincontent1.zip', tt[0].bincontent1)
    await fsAsync.writeFile( './dump/bincontent2.txt', tt[0].bincontent2)
    let s = Date.now() - (45380582 * 10000);

    //let d = Date.parse('2021-11-25 01:22:36') / 100000;
    let d = new Date( s )

    console.log( d )
    console.log( tt )
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
