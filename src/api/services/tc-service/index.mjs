import { BadRequest, NotFound, NotImplemented } from "../../../utils/errors.mjs";
import { TechnicalCapabilitiesRepository } from '../../repositories/index.mjs'
import TechnicalCapability from "../../model/technical-capability-model.mjs";
import { createTC, updateTC } from "./put-tc.mjs";
import tcRepository from "../../repositories/tc-repository/index.mjs";
import { TCDto } from "../../repositories/tc-repository/model.mjs";

const tcDataService = tcRepository;

/**
 * 
 * @param {TCDto} a 
 * @param {TCDto} b 
 * @returns 
 */
const isTCAttributesEquals = (a, b) => a.name === b.name &&
    (a.author ?? "") === (b.author ?? "") &&
    (a.status ?? "") === (b.status ?? "") &&
    (a.description ?? "") === (b.description ?? "") &&
    (a.goal_from ?? "") === (b.goal_from ?? "") &&
    (a.goal_to ?? "") === (b.goal_to ?? "") &&
    (a.version ?? "") === (b.version ?? "");

/**
 * 
 * @param {string[]} a 
 * @param {string[]} b 
 */
const isArrayEquals = (a, b) => a.length === b.length && !a.find(i => !b.find(j => j.toLowerCase() === i.toLowerCase()));

export class TechnicalCapabiliiesService {
    constructor() {
        this.getAll = this.getAll.bind(this);
        this.getByCode = this.getByCode.bind(this);
    }
    /**
     * 
     * @returns {Promise<Array<TechnicalCapability>>}
     */
    async getAll() {
        return tcDataService.all().then(lst => lst.map(d => new TechnicalCapability(d)));
    }

    async getByCode(code) {
        const tc = await tcDataService.byCode(code);
        if (!tc) throw NotFound(`TC с кодом = ${code} не найден`);
        return new TechnicalCapability(tc);
    }
    /**
     * 
     * @param {TechnicalCapability} targetTC 
     * @returns {Promise<TechnicalCapability>}
     */
    async putTC(targetTC) {
        if (!targetTC.system || !targetTC.system.code)
            throw BadRequest("У ТС не указан код системы system.code");

        const currentTC = await tcDataService.byCode(targetTC.code);
        if (!currentTC) {
            await createTC(targetTC);
            return this.getByCode(targetTC.code);
        }

        if (currentTC.sys_code.toLowerCase() !== targetTC.system.code.toLowerCase())
            throw BadRequest(`Обновление ТС [code=${targetTC.code}]: Нельзя поменять систему для ТС. ([${currentTC.sys_code}]->[${targetTC.system.code}])`);

        const is_att_equals = isTCAttributesEquals(targetTC, currentTC);
        const is_parents_equals = isArrayEquals(targetTC.parents.map(p => p.code), currentTC.parentCodes);
        if (is_att_equals && is_parents_equals) {
            console.log(`Измекнение ТС code=${targetTC.code}: изменение не требуется`);
            return this.getByCode(targetTC.code);
        }

        await updateTC(currentTC, targetTC)
        return this.getByCode(targetTC.code);
    }
}