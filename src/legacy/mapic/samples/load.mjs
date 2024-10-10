import https from "https"
import fs from 'fs'
import { SPARXApi } from "../../api/sparx.mjs";
import xlsx from 'xlsx';



//#region Работа с Excel

class ColumnDefinition {
    name;
    data;
    wch;
    style;
    constructor(c) {
        this.name = typeof c === 'string' ? c : c.name;
        const data = c.data ?? this.name;
        const data_function = typeof data === 'string' ? (d => d[data]) : d => data(d);
        this.data = c.style ? (d) => {
            let cell_data = data_function(d);
            if (cell_data && typeof cell_data === 'object') {
                return Object.assign({ s: c.style }, cell_data);
            }
            return { t: 's', v: cell_data, s: c.style };
        } : data_function;
        this.wch = c.w ?? 10;
    }
}


/**
 * 
 * @param {*} data 
 * @param {Array} columns 
 * @param {number} rowNum 
 * @param {number} colNum 
 * @returns 
 */
function rowsFromObject(data, columns, rowNum = 1, colNum = 0) {
    if (columns.length == 0) {
        return { rows: [{}], merges: [] }
    }

    let source = Array.isArray(data) ? data.map(r => ({ val: columns[0].data(r), tail: [r] })) : (Object.entries(data).map(function ([key, val]) {
        return { val: key, tail: val };
    }));

    let row_num = rowNum;
    let ret = { rows: [], merges: [] };
    //TODO Добавить обработку массивов-значений
    for (const { val, tail } of source) {
        let { rows, merges } = rowsFromObject(tail, columns.slice(1), row_num, colNum + 1);

        for (const cell_value of Array.isArray(val) ? val : [val]) {

            ret.rows = ret.rows.concat(rows.map(r => Object.assign({ [columns[0].name]: cell_value }, r)));

            ret.merges = ret.merges.concat(merges);
            if (rows.length > 1) {
                ret.merges.push({ s: { c: colNum, r: row_num }, e: { c: colNum, r: row_num + rows.length - 1 } });
            }
            row_num += rows.length;
        }
    }

    return ret;
}

export function sheetFromObject(data, columns, options = {}) {
    let column_defenitions = columns.map(c => new ColumnDefinition(c));
    let { rows, merges } = rowsFromObject(data, column_defenitions);
    let ws = xlsx.utils.json_to_sheet(rows, Object.assign({ header: column_defenitions.map(c => c.name) }, options));
    ws['!cols'] = column_defenitions.map(c => ({ wch: c.wch }));
    ws["!merges"] = merges;
    return ws;
}

//#endregion

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

//#endregion

class CollectionCache {
    #path;
    #data;
    #invalidatePeriod;
    #loadFn;
    #cacheTime;
    /**
     * 
     * @param {string} localPath Локальный путь к файлу кеша
     * @param {()=>Array} loadFn Функция получения акутальных данных
     * @param {number?} invalidatePeriod Время жизни кеша
     */
    constructor(localPath, loadFn, invalidatePeriod) {
        this.#path = localPath;
        this.#loadFn = loadFn;
        this.#invalidatePeriod = invalidatePeriod ?? 1000 * 60 * 60 * 10;
        this.#loadFile();
    }
    #loadFile() {
        if (fs.existsSync(this.#path) && (new Date() - fs.statSync(this.#path).mtime < this.#invalidatePeriod)) {
            this.#data = JSON.parse(fs.readFileSync(this.#path));
            this.#cacheTime = fs.statSync(this.#path).mtime;
        };
    }

    async #refresh() {
        let collection = await this.#loadFn();
        this.#data = {};
        for (let item of collection) {
            this.#data[item.id] = item; // [ ] Можно будет добавить возможность указывать функцию для ключа
        }
        fs.writeFileSync(this.#path, JSON.stringify(this.#data));
        this.#cacheTime = fs.statSync(this.#path).mtime;
    }
    #validate() {
        return this.#data &&
            this.#cacheTime &&
            new Date() - this.#cacheTime < this.#invalidatePeriod;
    }
    async byId(id) {
        if (!this.#validate()) {
            await this.#refresh();
        }
        return this.#data[id];
    }
    async asArray() {
        if (!this.#validate()) {
            await this.#refresh();
        }
        return Object.values(this.#data);
    }
    async data() {
        if (!this.#validate()) {
            await this.#refresh();
        }
        return this.#data;
    }
}

class EntityCache {
    #path;
    #data;
    #loadByIdFn;
    #invalidatePeriod;
    #cacheTime;
    /**
     * 
     * @param {string} localPath Путь к локальному файлу кеша 
     * @param {(id)=>any} loadByIdFn Функция загрузки актуального значения для элемента
     * @param {number?} invalidatePeriod Время жизни кеша
     */
    constructor(localPath, loadByIdFn, invalidatePeriod) {
        this.#path = localPath;
        this.#invalidatePeriod = invalidatePeriod ?? 1000 * 60 * 60 * 10;
        this.#loadByIdFn = loadByIdFn;
        this.#cacheTime = {};
        this.load();
    }

    #cacheTimePath() {
        return `${this.#path}.time`;
    }

    load() {
        if (fs.existsSync(this.#path)) {
            this.#data = JSON.parse(fs.readFileSync(this.#path));
        } else {
            this.#data = {};
        }
        if (fs.existsSync(this.#cacheTimePath())) {
            this.#cacheTime = JSON.parse(fs.readFileSync(this.#cacheTimePath()));
            for (let id in this.#cacheTime) {
                this.#cacheTime[id] = new Date(this.#cacheTime[id]);
            }
        } else {
            this.#cacheTime = {};
        }
    }

    async loadById(id) {
        this.#data[id] = await this.#loadByIdFn(id);
        this.#cacheTime[id] = new Date();
        this.save();
    }

    save() {
        fs.writeFileSync(this.#path, JSON.stringify(this.#data));
        fs.writeFileSync(this.#cacheTimePath(), JSON.stringify(this.#cacheTime));
    }

    async byId(id) {
        if (!this.#data[id] || !this.#cacheTime[id] || (new Date() - this.#cacheTime[id] > this.#invalidatePeriod)) {
            await this.loadById(id);
        }
        return this.#data[id];
    }
}

class TextFileCache {
    #dataFolder;
    #invalidatePeriod;
    #fileLoadFn;
    constructor(dataFolder, fileLoadFn, invalidatePeriod) {
        this.#dataFolder = dataFolder;
        this.#fileLoadFn = fileLoadFn;
        this.#invalidatePeriod = invalidatePeriod ?? 1000 * 60 * 60 * 10;
    }
    async loadFile(key) {
    }
    async byKey(key) {
        const local_path = `${this.#dataFolder}/${key}`;
        if (!fs.existsSync(local_path) || (new Date() - fs.statSync(local_path).mtime > this.#invalidatePeriod)) {
            fs.writeFileSync(local_path, await this.#fileLoadFn(key));
        }
        return fs.readFileSync(local_path).toString();
    }
}
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
//#endregion


class MAPIC {
    #access_token;
    #url;
    static AUTH_PATH = "/auth/2.0.0/token";
    static PRODUCTS_PATH = "/api/2.0.0/products";
    static CAPABILITIES_PATH = "/api/2.0.0/capabilities";
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
        this.#productsCache = new CollectionCache('./dump/products.json', () => this.getProducts());
        this.#productSubscriptionsCache = new EntityCache('./dump/product-subscriptions.json', (id) => this.getProductSubscriptions(id));
        this.#publishedApiCache = new EntityCache('./dump/published-api.json', (id) => this.getPublishedApi(id));
        this.#apiCache = new EntityCache('./dump/api.json', (id) => this.getApi(id));
        this.#capabilitiesCache = new CollectionCache('./dump/capabilities.json', () => this.capabilities())
        this.#apiSpecificationCache = new TextFileCache('./dump/specifications', (key) => this.getApiSpecification(key));
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

    async products() {
        return this.#productsCache.data();
    }
    /**
     * 
     * @param {number} productId ID продукта для которого запрашиваются подписки
     * @returns {Promise<Array<MAPICSubscription>>}
     */
    async productSubscriptions(productId) {
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
     * @returns {Array<{ id: number, name: string, description: string, cmdbUnit: string, 
     *      subscriptions : Array<{ id: number, publishedApiId : number, createDate: string, statusId: number, statusName: string,
     *          publishedApi: PublishedApi}>}>}
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

let mapic_url = "https://stage.mapic-dev.vimpelcom.ru"

async function main() {
    let start = new Date();
    console.log(start.toLocaleString());
    if (!process.env.mapic_credentials)
        throw Error('Надо установить mapic_credentials (login:password)');
    let [user, password] = process.env.mapic_credentials.split(':');
    let mapic = await MAPIC.connect(mapic_url, user, password);
    let current_time = new Date();

    let products = await mapic.products();

    let subscriptions = [];

    for (let product of Object.values(products)) {
        for (let subscription of await mapic.productSubscriptions(product.id)) {
            /** @type {MAPICPublishedApi} */
            if (subscription.statusName !== 'Active')
                continue;
            let published_api = await mapic.publishedApi(subscription.publishedApiId);
            let api = await mapic.Api(published_api.apiId);
            let capability = await mapic.capability(api.capabilityId)
            let provider = products[capability.productId]
            let spec = await mapic.apiSpecification(api.id);
            if (spec) {
                try {
                    // [ ] ДОбавить обработку различных форматов спецификаций
                    spec = JSON.parse(spec);
                } catch (error) {
                    spec = { info: { title: "not json format" } }
                }
            }

            subscriptions.push(
                {
                    consumer: product,
                    subscription: subscription,
                    publishedApi: published_api,
                    api: api,
                    capability: capability,
                    provider: provider,
                    api_title: spec?.info?.title
                });
        }
    }

    let sequence_interations = (await SPARXApi.getSequenceInteractions()).filter(s => s.consumer_code && s.srv_type === 'ProvidedInterface' && s.operation && s.supplier_code);

    let subscription_map = {}

    for (const subscription of subscriptions) {
        if (!subscription_map[subscription.consumer.cmdbUnit]) subscription_map[subscription.consumer.cmdbUnit] = { code: subscription.consumer.cmdbUnit, subscribers: {}, mapicConsumer: subscription.consumer };
        let consumer = subscription_map[subscription.consumer.cmdbUnit];
        if (!consumer.subscribers[subscription.provider.cmdbUnit]) consumer.subscribers[subscription.provider.cmdbUnit] = { code: subscription.provider.cmdbUnit, mapicApi: [], mapicProvider: subscription.provider };
        let subscriber = consumer.subscribers[subscription.provider.cmdbUnit];
        subscriber.mapicApi.push({ id: subscription.api.id, title: subscription.api_title });
    }

    for (const si of sequence_interations) {
        if (!subscription_map[si.consumer_code]) subscription_map[si.consumer_code] = { code: si.consumer_code, subscribers: {} };
        let consumer = subscription_map[si.consumer_code];
        consumer.eaConsumer = { name: si.consumer, code: si.consumer_code };
        if (!consumer.subscribers[si.supplier_code]) consumer.subscribers[si.supplier_code] = { code: si.supplier_code };
        let provider = consumer.subscribers[si.supplier_code];
        provider.eaProvider = { name: si.supplier, code: si.supplier_code };
        provider.eaApi = provider.eaApi ?? [];
        provider.eaApi.push({
            ia: si.ia, interface: si.interface_name, operation: si.operation
        });
    }

    let tmp = {};

    function subscribers(data) {
        let ret = {}
        for (const s in data) {
            ret[s] = {
                [data[s].mapicProvider?.cmdbUnit ?? ""]: {
                    [data[s].eaProvider?.code ?? ""]: [{
                        mapicApi: (data[s].mapicApi ?? []).map(a => `${a.id}: ${a.title}`).join('\r\n')
                        , eaApi : (data[s].eaApi ?? []).map(a => `${a.interface}: ${a.operation}`).join('\r\n')
                    }]
                }
            }
        }
        return ret;
    }
    for (const con in subscription_map) {
        tmp[con] = {
            [subscription_map[con].mapicConsumer?.cmdbUnit ?? ""]: {
                [subscription_map[con].eaConsumer?.code ?? ""]: subscribers(subscription_map[con].subscribers)
            }
        }
    }

    let wb = xlsx.utils.book_new();

    xlsx.utils.book_append_sheet(wb, sheetFromObject(
        tmp, [{
            name: "Потребитель"
        },
        {
            name: "Потребитель mapic"
        },
        {
            name: "Потребитель ea"
        },
        {
            name: "Поставщик"
        },
        {
            name: "Поставщик mapic"
        },
        {
            name: "Поставщик ea"
        },
        {
            name: "mapic api", data: (r) => r.mapicApi, w: 50, style : { alignment: { wordWrap: true}}
        },
        {
            name: "ea api", data: (r) => r.eaApi, w: 50, style : { alignment: { wordWrap: true}}
        },
        {
            name: "sequence", data: (r) => r.eaApi, w: 50, style : { alignment: { wordWrap: true}}
        }
    ]
    ))
    xlsx.writeFile(wb, './dump/integration-map.xlsx');

    console.log('!');
    process.exit();
}

main();