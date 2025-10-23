import { BadRequest } from "../../../utils/errors.mjs";
import System from "../../model/system.mjs";
import { tcRepository } from "../../repositories/index.mjs";


export const validateTC = async (code, context) => {
    if (code) {
        const tc = await tcRepository.byCode(code);
        if (!tc) throw Error(`TC с кодом [${code}] не найден. ${context ?? ""} `);
    }
}
/**
 * 
 * @param {string} systemCode 
 * @param {System} system 
 */
export const validatePutData = async (systemCode, system) => {
    if (!systemCode) throw BadRequest('Code parameter is not specified');
    if (!system) throw BadRequest('System is not specified');

    const container_map = {};
    const api_map = {};

    for (const c of system.containers ?? []) {
        if (!c.code || !c.code.length) throw BadRequest(`Container ${JSON.stringify(c)} has no code`);
        c.code = c.code.toLowerCase();

        if (!c.code.endsWith(systemCode.toLowerCase())) {
            throw BadRequest(`Полный код контейнера должен иметь вид <код контейнера внутри системы>.<код системы>. Код контейнера="${c.code}", код системы="${systemCode}"`);
        }
        if (container_map[c.code])
            throw BadRequest(`В запросе минимум два контейнера с одинаковым кодом:\n${JSON.stringify(container_map[c.code.toLowerCase()])}\n${JSON.stringify(c)}`);
        container_map[c.code] = c;

        for (const api of c.interfaces ?? []) {
            if (!api.code || !api.code.length)
                throw BadRequest(`${systemCode}: Есть интерфейс без кода (или с пустым кодом)\n${JSON.stringify(api)}`);
            api.code = api.code.toLowerCase();

            if (!api.code.endsWith(c.code)) {
                throw BadRequest(`Полный код интерфейса должен иметь вид <код интерфейса внутри контейнера>.<код контейнера>. Код интерфейса="${api.code}", код системы="${c.code}"`);
            }

            if (api_map[api.code]) {
                throw BadRequest(`${systemCode}:В запросе более оодного интерфейса с одним и тем же кодом\n${c.code}\n${JSON.stringify(api_map[api.code])}\n${JSON.stringify(api)}`);
            }
            await validateTC(api.implements, `Интерфейс ${api.code}`);

            const method_map = {};

            for (const m of api.methods ?? []) {
                if (!m.name || !m.name.length)
                    throw BadRequest(`В интейрфейс ${api.code} есть метод с пустым именем`);

                const matched = m.name.match(/^(?<method>(get)|(post)|(put)|(delete)|(patch))\s+(?<endpoint>.*)/i)
                if (matched) {
                    m.name = `${matched.groups?.method.toUpperCase()} ${matched.groups?.endpoint.toLowerCase()}`
                }
                const protocol = api.protocol?.toLowerCase();
                if (protocol == "soap" || protocol == "grpc") {
                    const t = m.name.split(".");
                    if (t.length > 1) {
                        t.shift();
                        m.name = t.join(".");
                    }
                }

                if (method_map[m.name])
                    throw BadRequest(`В интерфейсе ${api.code} обнаружен дубль метода ${m.name}`);
                await validateTC(m.implements, `Интерфейс ${api.code}, метод ${m.name}`);
            }
        }
    }
}