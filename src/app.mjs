import { YAMLMap } from 'yaml';
import app from './load-app.mjs'
import Repository from './utils/ea-repo.mjs'
import fsAsync from 'fs/promises'

process.env.API_PORT = process.env.API_PORT ?? 8080;


async function queryOnStart() {
    let tt = await Repository.queryRows("select * from t_diagramlinks limit 10");
    /*
    console.log(
        Object.entries(tt[0]).filter(([k, v]) => v)
        .map(([k,v])=>`${k}:'${v}'`).join(',')
    )
    */
    
    console.log(`class t_diagramlinks {${Object.keys(tt[0]).map(k=>`\n\t${k};`).join('')}
    }`)
    //*/
}

queryOnStart();

//throw Error('environment variable API_PORT not set');
let server = app.listen(process.env.API_PORT, () => {
    console.log(`Start listen on port ${process.env.API_PORT}`)
})

process.on('SIGINT', () => {
    console.log(`Stop listen and exit`);
    server.close();
})
