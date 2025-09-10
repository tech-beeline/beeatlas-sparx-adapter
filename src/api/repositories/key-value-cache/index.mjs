export class KeyValueCache {
    #values;
    #loadDate;
    #loadFn;
    #invalidatePeriod = 60 * 15;
    #key;
    #processFn;
    #loadPromise = null;
    #entity;
    constructor({ key, loadFn, processFn, period = 60 * 15, entity }) {
        this.#invalidatePeriod = period;
        this.#loadFn = loadFn;
        this.#key = key;
        this.#processFn = processFn ?? (this.#processFn = (c, r) => r);
        this.#entity = entity;
        this.invalidate();
    }

    invalidate() {
        if (this.#loadPromise) return;
        this.#loadPromise = this.load();
    }

    async load() {
        try {
            console.log(`${(new Date()).toISOString()} Начата загрузка кеша [${this.#entity}]`)
            const start_time = performance.now();
            const rows = await this.#loadFn();
            const values = {};

            for (const row of rows) {
                const key = row[this.#key].toLowerCase();
                values[key] = this.#processFn(values[key], row);
            }
            this.#values = values;
            this.#loadDate = new Date();
            console.info(`${(new Date()).toISOString()} Загрузка кеша завершена [${this.#entity}] (время загруки ${Math.floor(performance.now() - start_time)} ms)`);
        } catch (err) {
            console.error(`Ошибка при загрузке кеша ${err.message}\n${err.stack}`);
        } finally {
            this.#loadPromise = null;
        }
    }

    async #check() {
        if (!this.#values) await this.load();
        if (this.#loadDate < new Date() - this.#invalidatePeriod * 1000) {
            this.invalidate();
        }
    }
    async all() {
        await this.#check();
        return Object.values(this.#values);
    }
    async map() {
        await this.#check();
        return this.#values;
    }
    async byKey(key) {
        if (!key) throw Error(`key value is noit specified`);
        await this.#check();
        return this.#values[key.toLowerCase()];
    }
    /**
     * 
     * @param {string} key 
     * @param {*} value 
     * @returns
     */
    async updateValue(key, value) {
        if (!key) throw Error(`key value is noit specified`);

        this.invalidate();
        return this.#values[key.toLowerCase()] = value;
    }
}