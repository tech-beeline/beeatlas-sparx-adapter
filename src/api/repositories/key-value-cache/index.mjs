import { NotImplemented } from "../../../utils/errors.mjs";

class CacheOptions {
    entity;
    key;
    indexes;
    loadFn;
    onKeyDouble;
    invalidatePeriod;
    processFn;
}

class EntityIndex {
    #key;
    constructor({ key } = {}) {
        if (!key) throw Error(`Index key is not specified`);
        this.#key = key;
    }
    #data = {}
    add(val) {
        const key = val[this.#key]?.toLowerCase();
        if (key) {
            const items = this.#data[key] || (this.#data[key] = []);
            items.push(val);
        }
    }
    remove(val) {
        const key = val[this.#key]?.toLowerCase();
        if (key && this.#data[key]) {
            var tt = [];
            this.#data[key] = this.#data[key].filter(v => v !== val);
        }
    }
    get(key) {
        if (!key) throw Error(`key is not specified`);

        return this.#data[key.toLowerCase()] || [];
    }
}

class EntityData {
    #key;
    #data = {}
    #indexes = {};
    #KeyDobuleHandler
    /**
     * 
     * @param {CacheOptions} options 
     */
    constructor(options) {
        const { key, indexes = [] } = options;
        this.#key = key;
        for (const index of indexes) {
            this.#indexes[index] = new EntityIndex({ key: index });
        }
        this.#KeyDobuleHandler = options.onKeyDouble ?? ((a, val) => {
            console.warn(`Попытка вставить дублирующая запись для ${JSON.stringify(a)} (${JSON.stringify(val)})`);
            Object.assign(a, val);
            return;
        });
    }
    set(val) {
        if (!val) throw Error('value is not specified');

        const key = val[this.#key]?.toLowerCase();
        if (!key) throw Error(`key is null ${JSON.stringify(val)}`);

        if (this.#data[key]) {
            this.#KeyDobuleHandler(this.#data[key], val);
        }
        this.#data[key] = val;
        for (const index in this.#indexes) {
            this.#indexes[index].add(val);
        }
    }
    remove(key) {
        if (!key) throw Error(`key is not specified`);
        key = key.toLowerCase();

        const val = this.#data[key];
        for (const index in this.#indexes) {
            this.#indexes[index].remove(val);
        }
        delete this.#data[key];
    }
    /**
     * 
     * @param {string} key 
     * @returns 
     */
    get(key) {
        if (!key) throw Error(`key is not specified`);
        return this.#data[key.toLowerCase()]
    }
    all() {
        return Object.values(this.#data);
    }
    map() {
        return this.#data;
    }
    /**
     * 
     * @param {string} idx 
     * @returns {EntityIndex}
     */
    index(idx) {
        if (!this.#indexes[idx]) throw Error(`index "${idx}" is not found`);

        return this.#indexes[idx];
    }
}


export class KeyValueCache {
    /**@type {EntityData} */
    #data;
    #loadDate;
    #loadFn;
    #invalidatePeriod = 60 * 15;
    #key;
    #loadPromise = null;
    #entity;
    #indexes;
    #options;

    /**
     * 
     * @param {CacheOptions} options 
     */
    constructor(options) {
        const { key, loadFn, processFn, invalidatePeriod = 60 * 15, entity, indexes } = options;

        this.#options = options;
        this.#invalidatePeriod = invalidatePeriod;
        this.#loadFn = loadFn;
        this.#key = key;
        this.#entity = entity;
        this.#indexes = indexes;
        this.invalidate();
    }

    invalidate() {
        if (this.#loadPromise) return this.#loadPromise;
        return this.#loadPromise = this.load();
    }

    async load() {
        try {
            console.log(`${(new Date()).toISOString()} Начата загрузка кеша [${this.#entity}]`);

            const start_time = performance.now();
            const rows = await this.#loadFn();

            const data = new EntityData(this.#options);

            for (const row of rows) {
                data.set(row);
            }

            this.#data = data;
            this.#loadDate = new Date();
            console.info(`${(new Date()).toISOString()} Загрузка кеша завершена [${this.#entity}] (время загруки ${Math.floor(performance.now() - start_time)} ms)`);
        } catch (err) {
            console.error(`Ошибка при загрузке кеша ${err.message}\n${err.stack}`);
        } finally {
            this.#loadPromise = null;
        }
    }

    async #waitLoad() {
        if (!this.#data) return await this.invalidate();

        if (this.#loadDate < new Date() - this.#invalidatePeriod * 1000) {
            this.invalidate();
        }
    }

    async all() {
        await this.#waitLoad();
        return this.#data.all();
    }
    async map() {
        await this.#waitLoad();
        return this.#data.map();
    }
    async byKey(key) {
        if (!key) throw Error(`key value is not specified`);

        await this.#waitLoad();
        return this.#data.get(key);
    }
    async byIndex(index, key) {
        if (!index) throw Error(`index is not specified`);
        if (!key) throw Error(`key value is not specified`);

        await this.#waitLoad();
        return this.#data.index(index).get(key);
    }

    /**
     * 
     * @param {string} key 
     * @param {*} value 
     * @returns
     */
    async updateValue(key, value) {

        const current_value = await this.byKey( key );

        if( current_value ){
            Object.assign( current_value, value);
        } else {
            this.#data.set(value);
        }
        return current_value || value;
    }
    remove(key) {
        this.#data.remove(key);
    }
}