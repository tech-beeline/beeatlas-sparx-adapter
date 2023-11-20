import https from "http";

async function downloadFromGit() {
    console.log(`download interface agreement from gitlab`);
    let p = new Promise((resolve, reject) => {
        try {
            https.request('http://ms-seaapp001:804/pgsparxrepo/oslc/am/login', {
                method: "POST"
            },
                response => {
                    

                    if (response.statusCode !== 200) {
                        console.log( response);
                        reject(Error(`HTTP ${response.statusCode} : ${response.statusMessage}`));
                        return;
                    }

                    console.log( response.statusCode );

                    response.on('data', (d) => {
                        console.log('data')
                    })


                    response.on('end', (data) => {
                        console.log( response);
                        console.log('Interface Agreement downloaded from git')
                        resolve();
                    })
                        .on('error', (err) => {
                            console.error(err);
                            reject(err);
                        });
                }).on('error', (e) => reject(e)).end( "uid=webea;pwd=12webea)(;");
        } catch (ex) {
            console.error(ex);
            reject(ex);
        }
    });
    return p;
}

downloadFromGit();