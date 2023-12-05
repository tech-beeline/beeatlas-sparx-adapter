import http from 'http'
import OSLC from './oslc/oslc.mjs'


async function requestPromise(url, options, body) {
    return new Promise((resolve, reject) => {
        try {
            http.request(url, options,
                response => {
                    let chunks = [];
                    if (response.statusCode !== 200) {
                        reject(Error(`HTTP ${response.statusCode} : ${response.statusMessage}`));
                        return;
                    }

                    response.on('data', (chunk) => {
                        chunks.push(chunk);
                    })

                    response.on('end', (chunk) => {
                        if (chunk) {
                            chunks.push(chunk);
                        }
                        resolve(Buffer.concat(chunks));
                    })
                        .on('error', (err) => {
                            console.error(err);
                            reject(err);
                        });
                }).on('error', (e) => reject(e)).end(body);
        } catch (ex) {
            console.error(ex);
            reject(ex);
        }
    });
}

const EA_ENDPOINT = "http://ms-seaapp001.bee.vimpelcom.ru:804/ea_repo_bk/oslc"
const AUTH_PATH = "/am/login/"
const URSUS_ROOT_PACKAGE = '{89E8E918-60BC-4f03-A79B-BEE098874DBC}';

async function main(endpoint, uid, pwd) {
    let oslc = await OSLC.connect(endpoint, uid, pwd);
    let result = await oslc.createElement(
        {
            name: "Created Class",
            alias : 'created-1',
            description: "this class created by using OSLC API",
            author: "Машина",
            status : "Создан",
            type: "Component",
            stereotype: "ArchiMate3::ArchiMate_Capability",
            parentElementGUID: '{F01B4258-971C-4ba1-BA97-49A9280545B4}' //URSUS_ROOT_PACKAGE
        });
    console.log(result?.toString());
}

main(EA_ENDPOINT, "oslc", "oslcea");