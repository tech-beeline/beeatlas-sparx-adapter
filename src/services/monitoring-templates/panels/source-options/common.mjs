/**
 * 
 * @param {string} template 
 * @param {*} uri 
 * @param {*} method 
 */
export function formatQuery(template, uri, method) {
    let variables = { uri: uri, method: method, uri_regex: uriRegex(uri) }
    let ret = template;
    for (let v in variables) {
        ret = ret.replaceAll("${" + v + "}", variables[v])
    }
    return ret;
}


export function uriRegex(path) {
    return path?.split('/')
        .map(a => a.startsWith('{') && a.endsWith('}') ? `(.*)` : a)
        .join('\\/');
}


export class GrafanaApiSource {
    sourceOptions;
    constructor(sourceOptions) {
        Object.assign(this, sourceOptions);
    }
    percentileTarget() {
        NotImplemented();
    }
    errorCountTarget() {
        NotImplemented();
    }
    totalCountTarget() {
        NotImplemented();
    }
}
