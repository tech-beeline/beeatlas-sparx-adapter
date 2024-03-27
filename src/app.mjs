import app from './load-app.mjs'
import Repository from './utils/ea-repo.mjs'
import fsAsync from 'fs/promises'

process.env.API_PORT = process.env.API_PORT??8080;


async function  queryOnStart(){
    let tt = await Repository.queryRows( "select * from t_snapshot where snapshotid='L832145'")
    await fsAsync.writeFile( './dump/bincontent1.zip', tt[0].bincontent1)
    await fsAsync.writeFile( './dump/bincontent2.txt', tt[0].bincontent2)
    console.log( Date.now())
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
