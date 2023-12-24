import http from 'http'
import XMLJS from 'xml-js'

const AUTH_PATH = "/am/login/";
const RESOURCE_SHAPE_PATH = "/am/rs/resource/";
const RESOURCE_FACTORY_PATH = "/am/cf/resource/";
const RESOURCELINK_FACTORY_PATH = "/am/cf/resourcelink/";
const RESOURCE_UPDATE_PATH = "/am/pu/resource/"
const RESOURCE_PATH = "/am/resource/"
const RESOURCE_PROPERTY_MAP = {
    "identifier": "dcterms:identifier",
    status: "ss:status",
    description: "dcterms:description",
    name: "dcterms:title",
    title: "dcterms:title"
}


export class OSLCException extends Error {
    status;
    constructor(status, message) {
        super(message);
        this.status = status
    }
}
/**
 * 
 * @param {string} url 
 * @param {{ method: string?}} options 
 * @param {any} body 
 * @returns {Promise<Buffer>}
 */
async function request(url, options, body) {
    return new Promise((resolve, reject) => {
        try {
            http.request(url, options,
                response => {
                    let chunks = [];

                    response.on('data', (chunk) => {
                        chunks.push(chunk);
                    })

                    response.on('end', (chunk) => {
                        if (chunk) {
                            chunks.push(chunk);
                        }
                        if (response.statusCode !== 200 && response.statusCode !== 201 && response.statusCode !== 202) {
                            reject(new OSLCException(response.statusCode, `OSLC RESPONSE ${response.statusCode} : ${Buffer.concat(chunks).toString()}`))
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


class RDFMessage {

    _declaration = {
        _attributes: {
            version: "1.0",
            encoding: "UTF-8",
        },
    };
    ["rdf:RDF"] = {
        _attributes: {
            "xmlns:oslc_am": "http://open-services.net/ns/am#",
            "xmlns:rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
            "xmlns:ss": "http://www.sparxsystems.com.au/oslc_am#",
            "xmlns:foaf": "http://xmlns.com/foaf/0.1/",
            "xmlns:dcterms": "http://purl.org/dc/terms/"
        }
    };

    constructor(content) {
        if (typeof content === "object") {
            this["rdf:RDF"] = Object.assign(this["rdf:RDF"], content);
        }
    }
    toString() {
        return XMLJS.js2xml(this, { compact: true });
    }
}
class OSLCResource {
    ["oslc_am:Resource"] = {};
    constructor(src) {
        for (const prop in src ?? {}) {
            this[prop] = src[prop];
        }
    }
    set name(value) {
        this.title = value;
    }
    set identifier(value) {
        this["oslc_am:Resource"]["dcterms:identifier"] = value;
    }
    set title(value) {
        this["oslc_am:Resource"]["dcterms:title"] = value;
    }
    get title() {
        return this["oslc_am:Resource"]["dcterms:title"];
    }
    set description(value) {
        this["oslc_am:Resource"]["dcterms:description"] = value;
    }
    get description() {
        return this["oslc_am:Resource"]["dcterms:description"];
    }
    /**
     * @param {"Element" | "Package"} value
     */
    set resourceType(value) {
        this["oslc_am:Resource"]["ss:resourcetype"] = value;
    }
    set type(value) {
        this["oslc_am:Resource"]["dcterms:type"] = value;
    }
    set parentPackageGUID(value) {
        this.parentresourceidentifier = `pk_${value}`;
    }
    set parentElementGUID(value) {
        this.parentresourceidentifier = `el_${value}`;
    }
    set parentresourceidentifier(value) {
        this["oslc_am:Resource"]["ss:parentresourceidentifier"] = value;
    }
    set alias(value) {
        this["oslc_am:Resource"]["ss:alias"] = value;
    }
    set author(value) {
        this["oslc_am:Resource"]["dcterms:creator"] = {
            "foaf:Person": {
                "foaf:name": value
            }
        };
    }
    set stereotype(value) {
        this["oslc_am:Resource"]["ss:stereotype"] = {
            "ss:stereotypename": { "ss:name": value }
        };
    }
    set status(value) {
        this["oslc_am:Resource"]["ss:status"] = value;
    }
    set token(value) {
        this["oslc_am:Resource"]["ss:useridentifier"] = value;
    }
    set parentResource(value) { // [ ] Возможно переделать под приоритеты
        for (const name in value) {
            this[name] = value[name];
        }
    }
    toXml() {
        return XMLJS.js2xml(this, { compact: true });
    }
}

class OSLC {
    #userIdentifier;
    #host;
    async login() {
        if (this.#userIdentifier)
            return this;

        if (!process.env.OSLC_HOST)
            throw Error('enviroment variable "OSLC_HOST" not set');
        if (!process.env.OSLC_USER)
            throw Error('enviroment variable "OSLC_USER" not set');
        if (!process.env.OSLC_PASSWORD)
            throw Error('enviroment variable "OSLC_PASSWORD" not set');

        this.#host = process.env.OSLC_HOST;

        let auth_result = await request(`${this.#host}${AUTH_PATH}`, { method: "POST" }, `uid=${process.env.OSLC_USER};pwd=${process.env.OSLC_PASSWORD};`)

        let js_result = XMLJS.xml2js(auth_result, { compact: true });
        const rdf = js_result["rdf:RDF"];//["ss:login"]["ss:useridentifier"]
        if (!rdf) throw Error(`Отсутсвует элемент rdf:RDF ${xml}`);
        const login = rdf["ss:login"];
        if (!login) throw Error(`Отсутствует элемент ss:login ${xml}`);
        let identifier = login["ss:useridentifier"];
        if (!identifier) throw Error(`Отутствует элемент ss:useridentifier ${xml}`);
        this.#userIdentifier = identifier._text;
        return this;
    }
    /**
     * 
     * @param {OSLCResource} resource 
     * @param {*} parentResource 
     * @returns 
     */
    async createResource(resource, parentResource) {
        await this.login();

        if (!resource) {
            throw Error(`Resource is null`);
        }

        let request_body = new RDFMessage(
            new OSLCResource(
                Object.assign({
                    parentResource: parentResource,
                    token: this.#userIdentifier
                }, resource))
        );
        //        console.log(request_body.toString());

        let response = await request(`${this.#host}${RESOURCE_FACTORY_PATH}`, { method: "POST", headers: { "Content-Type": "text/xml" } }, request_body.toString());
        return response.toString();
    }
    async readResource(url) {
        await this.login();

        let response = await request(`${url}?useridentifier=${this.#userIdentifier}`, { method: "GET", headers: { "Content-Type": "text/xml" } });
        return response.toString();
    }
    async readResourceById(uid) {
        await this.login();

        return this.readResource(`${this.#host}${RESOURCE_PATH}${uid}/`);
    }

    async updateResource(resource) {
        let current_resource = await this.readResourceById(resource.identifier);
        current_resource = XMLJS.xml2js(current_resource, { compact: true })

        for (const prop in resource) {
            current_resource["rdf:RDF"]["oslc_am:Resource"][RESOURCE_PROPERTY_MAP[prop]] = resource[prop]
        }
        current_resource["rdf:RDF"]["oslc_am:Resource"]["ss:useridentifier"] = this.#userIdentifier

        let request_body = new RDFMessage(
            new OSLCResource(
                Object.assign({
                    token: this.#userIdentifier
                }, resource))
        );

        //console.log(XMLJS.json2xml(current_resource, { compact: true }));
        let response = await request(`${this.#host}${RESOURCE_UPDATE_PATH}`, { method: "POST", headers: { "Content-Type": "text/xml" } }, request_body.toString());
        //throw Error('Not implemented');
        return response;
    }
    async deleteResource(uid) {
        await this.login();
        return request(`${this.#host}${RESOURCE_PATH}${uid}/?useridentifier=${this.#userIdentifier}`, { method: "DELETE" });
    }
    async createLink(from, to) {
        await this.login();
        let xml = {
            "rdf:RDF": {
                _attributes: {
                    "xmlns:oslc_am": "http://open-services.net/ns/am#",
                    "xmlns:rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
                    "xmlns:ss": "http://www.sparxsystems.com.au/oslc_am#",
                    "xmlns:foaf": "http://xmlns.com/foaf/0.1/",
                    "xmlns:dcterms": "http://purl.org/dc/terms/"
                },
                "oslc_am:Resource": {
                    "dcterms:identifier": from,
                    "ss:Association": {
                        _attributes: {
                            "rdf:ID": "ID",
                            "rdf:resource": `${this.#host}${RESOURCE_PATH}${to}`
                        }
                    }
                },
                "rdf:Description": {
                    _attributes: {
                        "rdf:about" : "#ID"
                    },
                    "dcterms:type": "ArchiMate3::ArchiMate_Aggregation(UML::Association)",
                    "ss:useridentifier": this.#userIdentifier
                }
            }
        }
        console.log(XMLJS.js2xml(xml, { compact: true }));
        let response = await request(`${this.#host}${RESOURCELINK_FACTORY_PATH}`, { method: "POST", headers: { "Content-Type": "text/xml" } }, XMLJS.js2xml(xml, { compact: true }));

        
        console.log(response.toString());
    }
}

export default new OSLC();