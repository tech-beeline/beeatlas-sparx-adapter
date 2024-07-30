import https from 'https';

export async function request(url, options, body) {
    return new Promise((resolve, reject) => {
        try {
            const req = https.request(url, options,
                response => {
                    let chunks = [];

                    response.on('data', (chunk) => {
                        chunks.push(chunk);
                    })

                    response.on('end', (chunk) => {
                        if (chunk) {
                            chunks.push(chunk);
                        }

                        if (response.statusCode < 200 || response.statusCode > 299) {
                            reject(Object.assign(Error(`HTTP ${response.statusCode} : ${response.statusMessage}
${Buffer.concat(chunks).toString()}
                            `), { statusCode: response.statusCode }));
                            return;
                        }

                        resolve(Buffer.concat(chunks));
                    });
                    response.on('error', (err) => {
                        console.error(err);
                        reject(err);
                    });
                });

            if (body) {
                req.write(body)
            }

            req.end();
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

export async function postJSON(url, options, body) {
    body = JSON.stringify(body);
    options = Object.assign({ method: "POST" }, options);
    options.headers = Object.assign({}, options.headers)
    options.headers["Content-Type"] = "application/json"
    options.headers.Accept = "application/json"
    options.headers["Content-Length"] = Buffer.byteLength(body);

    return request(url, options, body).then(buffer => JSON.parse(buffer));
}
