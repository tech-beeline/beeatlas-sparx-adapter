import { getJSON } from "../../../utils/http-request-promise.mjs";

const OMD_URL = process.env.OPENMETADATA_URL ?? `https://open-metadata-stage.prod.dmp.vimpelcom.ru`
const GLOSSARY_TERMS_PATH = '/api/v1/glossaryTerms'
const REFRESH_TIME = process.env.OPENMETADATA_REFRESH_TIME ?? 60 * 60 * 1000;

export class GlossariesRepository {
    #glossaryCache = {
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

    async #getGlossaryMap() {
        if (this.#refreshTime <= Date.now()) {
            this.#glossaryCache = {}
            this.#terms = await getJSON(`${OMD_URL}${GLOSSARY_TERMS_PATH}?limit=100000`, this.#defaultRequestOption).then(r => r.data);
            this.#terms.forEach(t => {
                (this.#glossaryCache[t.glossary.id] ?? (this.#glossaryCache[t.glossary.id] = Object.assign({ terms: [] }, t.glossary))).terms.push(t)
            })

            this.#refreshTime = Date.now() + REFRESH_TIME;
        }
        return this.#glossaryCache;
    }

    async getGlossaries() {
        return this.#getGlossaryMap().then(m => Object.values(m).map(g => ({
            id: g.id,
            type: g.type,
            name: g.name,
            fullyQualifiedName: g.fullyQualifiedName,
            description: g.description,
            displayName: g.displayName,
            deleted: g.deleted,
            href: g.href
        })));
    }

    /**
     * 
     * @param {string} id 
     * @returns {Promise<Glossary>}
     */
    async getGlossarById(id) {
        return (await this.#getGlossaryMap())[id];
    }

    async getGlossaryTerms(id) {
        return this.getGlossarById(id).then(g => g.terms);
    }
    async getAllTerms() {
    }
}
