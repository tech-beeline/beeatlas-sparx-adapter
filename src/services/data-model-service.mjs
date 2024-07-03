import { NotImplemented } from "../utils/errors.mjs";
import { getJSON } from "../utils/http-request-promise.mjs";

const OMD_URL = process.env.OPENMETADATA_URL ?? `https://open-metadata-stage.prod.dmp.vimpelcom.ru`
const GLOSSARIES_PATH = '/api/v1/glossaries'
const GLOSSARY_TERMS_PATH = '/api/v1/glossaryTerms'
const REFRESH_TIME = process.env.OPENMETADATA_REFRESH_TIME ?? 60 * 60 * 1000;


class Term {
    id;
    name;
    displayName;
    description;
    fullyQualifiedName;
    synonyms;
    version;
    status;
    deleted;

    constructor(obj) {
        if (!obj) return;
        for (const fld in this) {
            if (obj[fld]) this[fld] = obj[fld];
        }
    }
}
class Glossary {
    id;
    name;
    description;
    fullyQualifiedName;
    version;
    deleted;
    #terms = [];

    constructor(obj) {
        if (!obj) return;
        for (const fld in this) {
            if (obj[fld]) this[fld] = obj[fld];
        }
    }
    addTerm(term) {
        this.#terms.push(new Term(term));
    }
    get terms() {
        return this.#terms;
    }
}

class DataModelService {
    #glossaries = {
    };

    #terms;

    #refreshTime = Date.now();
    get #token() {
        if (!process.env.OPENMETADATA_TOKEN) throw Error('OPENMETADATA_TOKEN is not set')
        return process.env.OPENMETADATA_TOKEN;
    }
    get #defaultRequestOption() {
        return {
            headers: {
                'Authorization': `Bearer ${this.#token}`,
                'accept': 'application/json'
            }, rejectUnauthorized: false
        }
    }

    async getGlossaries() {
        if (this.#refreshTime <= Date.now()) {
            let glossaries = await getJSON(`${OMD_URL}${GLOSSARIES_PATH}?limit=10000`, this.#defaultRequestOption);
            this.#glossaries = glossaries.data.reduce((acc, it) => Object.assign(acc, { [it.id]: new Glossary(it) }), {});
            this.#terms = await getJSON(`${OMD_URL}${GLOSSARY_TERMS_PATH}?limit=100000`).then(r => r.data);
            this.#terms.forEach(t => {
            })

            this.#refreshTime = Date.now() + REFRESH_TIME;
        }
        return Object.values(this.#glossaries);
    }

    /**
     * 
     * @param {string} id 
     * @returns {Promise<Glossary>}
     */
    async getGlossarById(id) {
        return getGlossaries()[id];
    }

    async getGlossaryTerms(id) {
        return this.getGlossarById(id).then(g => g.terms);
    }
    async getAllTerms() {
    }
}



export default new DataModelService();