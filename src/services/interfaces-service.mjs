import { APIInterface, APIMethod, APIMethodParameter } from '../model/system.mjs';
import t_object from '../utils/ea-model/t_object.mjs';
import t_operation from '../utils/ea-model/t_operation.mjs';
import t_operationparams from '../utils/ea-model/t_operationparams.mjs';
import INTERFACES_QUERIES from './sql/interfaces-queries.mjs'
import Repository from '../utils/ea-repo.mjs'


export class InterfaceCatalog {
    byMethodGUID = {};
    async #loadInterfaceByOperationGUID(operationGUID) {
        let ea_i = await Repository.queryOne(`select * from t_object where object_id = (select object_id from t_operation where ea_guid=$1)`, [operationGUID])
        if( ea_i ){
            let operations = await Repository.find( t_operation, { object_id: ea_i.object_id});
            let i = new APIInterface( {...ea_i, methods: operations.map( m=>new APIMethod(m))});
            for( let o of i.methods ){
                this.byMethodGUID[o.ea_guid] = i;
            }
            return i;
        }
    }
    /**
     * 
     * @param {string} operationGUID 
     * @returns {Promise<APIInterface>}
     */
    async byOperationGUID(operationGUID) {
        return this.byMethodGUID[operationGUID] ?? (await this.#loadInterfaceByOperationGUID(operationGUID))
    }
}

class InterfacesService {
    async getInterface(code) {
        return this.#interfaceByAlias(code).then(i => new APIInterface({ name: i.name, version: i.version, code: i.alias, i_id: i.object_id }));
    }
    async #interfaceByAlias(alias) {
        if (!alias) {
            throw Object.assign(Error(`Не задан код`), { status: 406 })
        }
        let i = await Repository.find(t_object, { alias: alias, object_type: 'Interface' }).then(rows => rows.find(v => v));
        if (!i)
            throw Object.assign(Error(`Интефрейс с кодом ${alias} не найден`), { status: 404 });
        return i;
    }
    async #rawMethodsByInterfaceId(id) {
        let methods = (await Repository.find(t_operation, { object_id: id })).reduce((acc, v) => Object.assign(acc, { [v.operationid]: v }), {});
        (await Repository.queryRows({ text: INTERFACES_QUERIES.METHOD_PARAMTER_QUERY, values: [id] })).forEach(p => {
            methods[p.operationid].parameters = methods[p.operationid].parameters ?? [];
            methods[p.operationid].parameters.push(p);
        });
        return Object.values(methods);
    }
    async #rawMethodsByInterfaceCode(code) {
        const i = await this.#interfaceByAlias(code);
        return this.#rawMethodsByInterfaceId(i.object_id);
    }
    /**
     * 
     * @param {string} code 
     * @returns {Promise<Array<APIMethod>}
     */
    async getMethodsByInterfaceCode(code) {
        return (await this.#rawMethodsByInterfaceCode(code))
            .map(m => new APIMethod({
                name: m.name, returnType: m.type, description: m.notes, parameters:
                    m.parameters?.map(p => ({ name: p.name, type: p.type, description: p.notes ?? undefined }))
            }));
    }

    /**
     * 
     * @param {APIMethod[]} methods 
     */
    async insertMethods(methods) {
    }
    /**
     * 
     * @param {string} code 
     * @param {Array<APIMethod>} methods 
     */
    async putMethods(code, methods, apiInterface = { code: code }) {
        if (!methods || !methods.length) return [];
        let methods_map = {};
        const i = await this.#interfaceByAlias(code);


        for (const m of (await this.#rawMethodsByInterfaceCode(code))) {
            methods_map[m.name] = methods_map[m.name] ?? {};
            methods_map[m.name].asis = m;
        }

        let pos = 0;
        for (const m of methods) {
            methods_map[m.name] = methods_map[m.name] ?? {};
            m.pos = pos++;
            methods_map[m.name].tobe = m;
        }

        // [ ] Подумать, что делать с удалением методов

        let methods_to_remove = Object.values(methods_map).filter(v => !v.tobe);
        if (methods_to_remove.length > 0) {
            await Repository.deleteMethods(methods_to_remove.map(m => m.asis.operationid))
        }

        let methods_to_update = Object.values(methods_map)
            .filter(v => v.asis && v.tobe);

        await Repository.updateMethods(methods_to_update.filter(v => v.asis.name !== v.tobe.name
            || (v.asis.type ?? '') !== (v.returnType ?? '')
            || v.asis.pos !== v.tobe.pos
            || (v.asis.notes ?? '') !== (v.tobe.description ?? '')
        ).map(m => ({
            operationid: m.asis.operationid,
            name: m.tobe.name, type: m.tobe.returnType, description: m.tobe.description, pos: m.tobe.pos
        })));

        let methods_to_insert = Object.values(methods_map).filter(v => !v.asis);
        let inserted_methods = await Repository.insertMethods(methods_to_insert.map(m => ({
            name: m.tobe.name, description: m.tobe.description, object_id: i.object_id, pos: m.tobe.pos,
            type: m.tobe.returnType
        })));

        for (const m of inserted_methods) {
            methods_map[m.name].tobe.operationid = m.operationid;
        }

        let parameters_map = [];
        for (const m of [...methods_to_update, ...methods_to_insert]) {
            let params = {};
            for (const p of m.asis?.parameters ?? []) {
                params[p.name] = params[p.name] ?? {};
                params[p.name].asis = p;
            }
            let pos = 0;
            for (const p of m.tobe.parameters ?? []) {
                params[p.name] = params[p.name] ?? {};
                p.operationid = m.asis?.operationid ?? m.tobe.operationid;
                p.pos = pos++;
                params[p.name].tobe = p;
            }
            parameters_map.push(...Object.values(params));
        }

        let parameters_to_update = parameters_map.filter(v => v.asis && v.tobe)
            .filter(({ asis, tobe }) => (asis.description ?? '') !== (tobe.description ?? '')
                || (asis.type ?? '') !== (tobe.type ?? '')
                || asis.pos != tobe.pos);

        await Repository.updateMethodParameters(parameters_to_update.map(p => ({
            operationid: p.tobe.operationid,
            name: p.asis.name,
            pos: p.tobe.pos,
            type: p.tobe.type,
            description: p.tobe.description
        })))

        await Repository.insertParameters(parameters_map.filter(v => !v.asis).map(p => ({
            operationid: p.tobe.operationid,
            name: p.tobe.name,
            type: p.tobe.type,
            description: p.tobe.description,
            pos: p.tobe.pos
        })));

        //[ ] Добавить удаление параметров у методов

    }
}

export default new InterfacesService() 