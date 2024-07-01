import https from 'https';

export async function request(url, options, body) {
    return new Promise((resolve, reject) => {
        try {
            https.request(url, options,
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
export async function get(url, options) {
    return request(url, Object.assign({ method: "GET" }, options));
}

export async function getJSON(url, options) {
    return request(url, Object.assign({ method: "GET" }, options)).then(buffer => JSON.parse(buffer));
}
