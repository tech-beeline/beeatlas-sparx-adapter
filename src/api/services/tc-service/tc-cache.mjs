import { BadRequest } from "../../../utils/errors.mjs";
import TechnicalCapability from "../../model/technical-capability-model.mjs";
import { TechnicalCapabilitiesRepository } from "../../repositories/index.mjs";

const tcDataService = new TechnicalCapabilitiesRepository();


const REFRESH_PERIOD = 60 * 15;

export class TechnicalCapabilityCache {
    #loadDate;
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
            this.#loadDate = new Date();
            console.info("Загрузка кеша ТС завершена");
        } catch (err) {
            console.err(err);
            //throw Error("Ошибка при запросе списка ТС", err);
        } finally {
            this.#loading = null;
        }
    }
    async checkAndLoad() {
        if (!this.#data) await this.load();
        if (this.#loadDate < new Date() - REFRESH_PERIOD * 1000) {
            this.invalidate();
        }
    }
    async all() {
        await this.checkAndLoad();
        return Object.values(this.#data);
    }
    async byCode(code) {
        if (!code) throw BadRequest("code is null or undefined");
        await this.checkAndLoad();
        return this.#data[code.toLowerCase()];
    }
    async update(tc) {
        this.invalidate();
        return this.#data[tc.code.toLowerCase()] = tc;
    }
}
const instance = new TechnicalCapabilityCache();

export default instance;