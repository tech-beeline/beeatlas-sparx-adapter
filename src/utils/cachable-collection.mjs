import fs from 'fs'

export default class CachableCollection {
    #data = {};
    #storageItemAsFile;
    #invalidatePeriod
    #localPath;
    #cacheTime;

    constructor({ localPath, invalidatePeriod, loadCollectionFn, loadItemFn, storageItemAsFile }) {
        this.#invalidatePeriod = invalidatePeriod ?? 1000 * 60 * 60 * 10;
        this.#localPath = localPath;
        this.#storageItemAsFile = storageItemAsFile;

        if (loadCollectionFn) {
            this.loadCollectionFn = loadCollectionFn;
            // Загрузка коллекции
            if (fs.existsSync(this.#localPath) && (new Date() - fs.statSync(this.#localPath).mtime < this.#invalidatePeriod)) {
                this.#data = JSON.parse(fs.readFileSync(this.#localPath));
                this.#cacheTime = fs.statSync(this.#localPath).mtime;
            };

            this.get = async function (id) {
                if (!this.#data || !this.#cacheTime || (new Date() - this.#cacheTime) > this.#invalidatePeriod) {
                    this.#data = JSON.parse(await this.loadCollectionFn());
                    fs.writeFileSync(this.#localPath, JSON.stringify(this.#data));
                }
                return this.#data[id];
            }
            this.data = async function () {
                if (!this.#data || !this.#cacheTime || (new Date() - this.#cacheTime) > this.#invalidatePeriod) {
                    this.#data = await this.loadCollectionFn();
                    fs.writeFileSync(this.#localPath, JSON.stringify(this.#data));
                }
                return this.#data;
            }
        }

        if (loadItemFn) {
            this.loadItemFn = loadItemFn;
            if (storageItemAsFile) {
                this.get = async function (id) {
                    const local_path = `${this.#localPath}/${id}`;
                    if (!fs.existsSync(local_path) || (new Date() - fs.statSync(local_path).mtime > this.#invalidatePeriod)) {
                        fs.writeFileSync(local_path, await this.loadItemFn(id));
                    }
                    return fs.readFileSync(local_path).toString();
                }
                return;
            }
            if (fs.existsSync(this.#localPath)) {
                this.#data = JSON.parse(fs.readFileSync(this.#localPath));
            }
            for (const id in this.#data) {
                this.#data[id].cacheTime = new Date(this.#data[id].cacheTime);
            }
            this.get = async function (id) {
                if (!this.#data[id] || ((new Date() - this.#data[id].cacheTime) > this.#invalidatePeriod)) {
                    this.#data[id] = {
                        value: await this.loadItemFn(id),
                        cacheTime: new Date()
                    }
                    fs.writeFileSync(this.#localPath, JSON.stringify(this.#data));
                }
                return this.#data[id].value;
            }
        }
    }

    async byId(id) {
        return this.get(id);
    }
    async byKey(key){
        return this.get(key);
    }

    async get(id) {

    }
}