import { BadRequest } from "../../../utils/errors.mjs";
import TechnicalCapability from "../../model/technical-capability-model.mjs";
import { TechnicalCapabilitiesRepository } from "../../repositories/index.mjs";

const tcDataService = new TechnicalCapabilitiesRepository();


const REFRESH_PERIOD = 60 * 15;

export class TechnicalCapabilityCache {
    #data;
    /**@type {Promise} */
    #loading = null;
    /**
     *
     */
    constructor() {
        this.invalidate();
    }
    invalidate() {
        if (this.#loading) return;
        this.#loading = this.load();
    }
    async load() {
        try {
            console.info("Начата загрузка кеша ТС")
            const tc_rows = await tcDataService.selectTCList();
            const tc_map = {};

            for (const row of tc_rows) {
                const tc = tc_map[row.code.toLowerCase()] ?? (tc_map[row.code.toLowerCase()] = new TechnicalCapability(row));
                tc.addParent({ code: row.parent_code });
            }
            this.#data = tc_map;
            console.info("Загрузка кеша ТС завершена");
        } catch (err) {
            console.err(err);
            throw Error("Ошибка при запросе списка ТС", err);
        } finally {
            this.#loading = null;
            setTimeout(() => this.load(), REFRESH_PERIOD * 1000);
        }
    }
    async all() {
        return this.#loading ? this.#loading.then(() => Object.values(this.#data)) : Object.values(this.#data);
    }
    async byCode(code) {
        if (!code) throw BadRequest("code is null or undefined");
        return this.#loading ? this.#loading.then(() => this.#data[code.toLowerCase()]) : () => this.#data[code.toLowerCase()];
    }
}
const instance = new TechnicalCapabilityCache();

export default instance;