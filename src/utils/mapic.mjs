import https from 'https';
import CachableCollection from "./cachable-collection.mjs";

//#region Типы MAPIC
class PublishedApi {
    /**
     * @type {number}
     */
    id;
    apiId;
    statusName;
    statusId;
    /**
     * @type {MAPICCapability?}
     */
    api;
}

class MAPICApi {
    id;
    capabilityId;
    statusName;
    statusId;
    /**
     * @type {MAPICCapability?}
     */
    capability;
}

class MAPICCapability {
    id;
    name;
    description;
    productId;
    statusName;
    statusId;
}

class MAPICPublishedApi {
    id;
    apiId;
    statusName;
    statusId;
    /**
     * @type {MAPICApi}
     */
    api;
}

class MAPICSubscription {
    id;
    statusName;
    statusId;
    publishedApiId;
    /**
     * @type {MAPICPublishedApi}
     */
    publishedApi;
}

class MAPICProductDetails {
    id;
    name;
    description;
    cmdbUnit;
    /**
     * @type {Array<MAPICSubscription>}
     */
    subscriptions;
}

//#region HTTP helpers
async function post(url, body, options) {
    return request(url, Object.assign({ method: "POST" }, options), body);
}

async function request(url, options, body) {
    console.log(`request ${url}`)
    let p = new Promise((resolve, reject) => {
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
    return p;
}

async function get(url, options) {
    return request(url, Object.assign({ method: "GET" }, options));
}

export default class MAPIC {
    #access_token;
    #url;
    static AUTH_PATH = "/auth/2.0.0/token";
    static PRODUCTS_PATH = "/api/2.0.0/products";
    static CAPABILITIES_PATH = "/api/v4/capabilities";
    #default_options
    #productsCache;
    #capabilitiesCache;
    #productSubscriptionsCache;
    #publishedApiCache;
    #apiCache;
    #apiSpecificationCache;

    constructor(url, token) {
        this.#url = url;
        this.#access_token = token;
        this.#default_options = {
            headers: {
                'Authorization': `Bearer ${token}`,
                'accept': 'application/json'
            },
            rejectUnauthorized: false
        }
        this.#productsCache = new CachableCollection({ localPath: './dump/products.json', loadCollectionFn: async () => this.getProducts() });
        this.#productSubscriptionsCache = new CachableCollection({ localPath: './dump/product-subscriptions.json', loadItemFn: async (id) => this.getProductSubscriptions(id) });
        this.#publishedApiCache = new CachableCollection({ localPath: './dump/published-api.json', loadItemFn: (id) => this.getPublishedApi(id) });
        this.#apiCache = new CachableCollection({ localPath: './dump/api.json', loadItemFn: (id) => this.getApi(id) });
        this.#capabilitiesCache = new CachableCollection({ localPath: './dump/capabilities.json', loadItemFn: (id) => this.loadCapabilityById(id) });
        this.#apiSpecificationCache = new CachableCollection({ localPath: './dump/specifications', loadItemFn: (key) => this.getApiSpecification(key), storageItemAsFile: true });
    }

    static async connect(url, username, password) {
        let res = JSON.parse(await post(`${url}${this.AUTH_PATH}`, `grant_type=password&username=${username}&password=${password}`, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            rejectUnauthorized: false
        }));
        return new MAPIC(url, res.access_token);
    }

    /**
     * 
     * @returns {Promise<MAPICProductDetails>}
     */
    async products() {
        return await this.#productsCache.data();
    }
    /**
     * 
     * @param {number} productId ID продукта для которого запрашиваются подписки
     * @returns {Promise<Array<MAPICSubscription>>}
     */
    async productSubscriptions(productId) {
        if (!productId)
            throw Error('productId not set');
        return this.#productSubscriptionsCache.byId(productId);
    }
    async publishedApi(publishedApiId) {
        return this.#publishedApiCache.byId(publishedApiId);
    }
    /**
     * 
     * @param {number} apiId 
     * @returns {Promise<MAPICApi>}
     */
    async Api(apiId) {
        return this.#apiCache.byId(apiId);
    }
    /**
     * 
     * @param {number} capabilityId 
     * @returns {Promise<MAPICCapability>}
     */
    async capability(capabilityId) {
        return this.#capabilitiesCache.byId(capabilityId);
    }
    async apiSpecification(apiId) {
        return this.#apiSpecificationCache.byKey(apiId);
    }


    async getApiSpecification(apiId) {
        return get(`${this.#url}/api/v2/api/${apiId}/specification`, this.#default_options);
    }
    /**
     * 
     * @param {{ 
     *  loadCapabilities : boolean?,
     *  loadAPI : boolean?,
     *  loadSubscription}} options 
     * @returns {Promis<Array<{ id: number, name: string, description: string, cmdbUnit: string, 
     *      subscriptions : Array<{ id: number, publishedApiId : number, createDate: string, statusId: number, statusName: string,
     *          publishedApi: PublishedApi}>}}>}
     */
    async getProducts(options) {
        let products = JSON.parse(await get(`${this.#url}${MAPIC.PRODUCTS_PATH}`, this.#default_options));

        if (options) {
            if (options.loadCapabilities || options.loadAPI) {
                console.log(`Load products capabilities`);
                for (let product of products) {
                    product.capabilities = await this.productCapabilities(product.id);
                    if (options.loadAPI) {
                        console.log('Load product api');
                        for (let capability of product.capabilities) {
                            capability.api = await this.capabilityApi(capability.id, true);
                        }
                    }
                }
            }
            if (options.loadSubscription) {
                console.log('Load products subscription');
                let published_api_map = {};
                for (let product of products) {
                    product.subscriptions = await this.getProductSubscriptions(product.id);
                }
            }
        }
        return products;
    }
    /**
     * 
     * @param {number} apiId 
     * @returns {Promise<MAPICApi>}
     */
    async getApi(apiId) {
        return JSON.parse(await get(`${this.#url}/api/v2/api/${apiId}`, this.#default_options));
    }

    /**
     * 
     * @param { { statusFilter: string | Array<string>}} options 
     * @returns {Promise<MAPICProductDetails>}
     */
    async productsDetails(options) {
        let product_list = await this.getProducts({ loadSubscription: true });
        let product_map = {};
        let api_map = {};
        let capability_map = {};
        let published_api_map = {};

        let subscription_filter_fn = (options && options.statusFilter) ?
            (typeof options.statusFilter === "string" ? c => c.statusName === options.statusFilter : c => options.statusFilter.find(c.statusName) != undefined) :
            (c) => true;


        // Трансформация в ассоциативный словарь
        for (let product of product_list) {
            product_map[product.id] = product;
        }
        console.log(product_map);
        //Загрузка для подписок API
        for (let product of product_list) {
            for (let subscription of product.subscriptions) {
                if (!subscription_filter_fn(subscription)) {
                    continue;
                }
                if (!published_api_map[subscription.publishedApiId]) {
                    let published_api = await this.publishedApi(subscription.publishedApiId);
                    if (!api_map[published_api.apiId]) {
                        let api = await this.getApi(published_api.apiId);
                        if (!capability_map[api.capabilityId]) {
                            capability_map[api.capabilityId] = await this.getCapabilityById(api.capabilityId);
                        }
                        api.capability = capability_map[api.capabilityId];
                        api_map[published_api.apiId] = api;
                    }
                    published_api.api = api_map[published_api.apiId];
                    published_api_map[subscription.publishedApiId] = published_api;
                }
                subscription.publishedApi = published_api_map[subscription.publishedApiId];// await publishedApiById(subscription.publishedApiId);
                if (!subscription.publishedApi) {
                    console.log(subscription);
                }
            }
        }
        return product_map;
    }

    async productCapabilities(productId) {
        return JSON.parse(await get(`${this.#url}${MAPIC.PRODUCTS_PATH}/${productId}/capabilities`, this.#default_options));
    }
    async loadCapabilityById( id ){
        return JSON.parse(await get(`${this.#url}${MAPIC.CAPABILITIES_PATH}/${id}`, this.#default_options));
    }
    async capabilities() {
        return JSON.parse(await get(`${this.#url}${MAPIC.CAPABILITIES_PATH}`, this.#default_options));
    }
    /**
     * 
     * @param {number} capabilityId 
     * @returns {Promise<MAPICCapability>}
     */
    async getCapabilityById(capabilityId) {
        return JSON.parse(await get(`${this.#url}/api/v2/capabilities/${capabilityId}`, this.#default_options));
    }
    async getApiPublishedApi(apiId) {
        return JSON.parse(await get(`${this.#url}/api/v2/api/${apiId}/published-api`, this.#default_options));
    }
    /**
     * 
     * @param {number} publishedApiId 
     * @returns { Promise<{id: number
     *  apiId: number,
     *  createDate : string
     * }>}
     */
    async getPublishedApi(publishedApiId) {
        return JSON.parse(await get(`${this.#url}/api/v2/published-api/${publishedApiId}`, this.#default_options));
    }
    async capabilityApi(capailityId, loadPublishedApi) {
        let api_list = JSON.parse(await get(`${this.#url}${MAPIC.CAPABILITIES_PATH}/${capailityId}/api`, this.#default_options));
        if (loadPublishedApi) {
            for (let api of api_list) {
                api.publishedApi = await this.getApiPublishedApi(api.id);
            }
        }
        return api_list;
    }
    async getProductSubscriptions(productId) {
        return JSON.parse(await get(`${this.#url}/api/v1/products/${productId}/subscriptions`, this.#default_options));
    }
}