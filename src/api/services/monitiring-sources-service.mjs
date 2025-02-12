import { MonitoringRepository } from "../repositories/index.mjs";
import GrafanaSource from "../model/GrafanaSource.mjs";


const SKIP_PROPERIES = ["name", "sourceId", "label", "type", "uid"]
const mointoringRepository = new MonitoringRepository();


class MonitiringSourcesServices {

    async getAllSources() {
        const rows = await mointoringRepository.selectSourcesProperties();
        const sourceMap = {};
        for (const row of rows) {
            /** @type {GrafanaSource} */
            const source = sourceMap[row.ea_guid] ?? (sourceMap[row.ea_guid] = new GrafanaSource(row.name, row.ea_guid));
            source.addProperty(row.property, row.value);
        }
        return Object.values(sourceMap);
    }

    async setSource(source) {
        if (source.uid) {
            mointoringRepository.deleteSourceProperties(source.uid);
        } else {
            const new_source = await mointoringRepository.insertSource(source.name);
            source.uid = new_source.uid;
        };

        const properties = Object.entries(source).filter(([k, v]) => !SKIP_PROPERIES.includes(k))
            .map(([k, v]) => ({ property: k, value: v }));

        properties.push({ property: source.type, value: source.sourceId });
        await mointoringRepository.insertSourceProperties(source.uid, properties)
        return this.getSource(source.uid);
    }

    #buildSource(rows) {
        let source = null;
        for (const row of rows) {
            /** @type {GrafanaSource} */
            source = source ?? (source = new GrafanaSource(row.name, row.ea_guid));
            source.addProperty(row.property, row.value);
        }
        return source;
    }
    async getSource(uid) {
        return this.#buildSource(await mointoringRepository.selectSourcePropertiesByUID(uid));
    }

    async getSystemSource(systemCode) {
        return this.#buildSource(await mointoringRepository.selectSystemSource(systemCode));
    }

    async getObjectSource(object_id) {
        return this.#buildSource(await mointoringRepository.selectObjectSource(object_id));
    }
    /**
     * 
     * @param {string} systemCode 
     * @param {{uid}} source 
     */
    async setSystemSource(systemCode, source) {
        const currentSource = await this.getSystemSource(systemCode);
        if (currentSource?.uid === (source.uid ?? undefined)) {
            return currentSource;
        }
        if (currentSource) {
            await mointoringRepository.removeSystemSourceLink(systemCode, currentSource.uid);
        }
        if (source.uid) {
            await mointoringRepository.setSystemSourceLink(systemCode, source.uid);
        };
        return this.getSystemSource(systemCode)
    }

    async setObjectSource({ object_id, uid }) {
        const currentSource = await this.getObjectSource(object_id);
        if (currentSource?.uid === uid) {
            return currentSource;
        }

        if (currentSource) {
            await mointoringRepository.removeObjectSourceLink(object_id, currentSource.uid);
        }

        if (uid) {
            await mointoringRepository.setObjectSourceLink(object_id, uid);
        }

        return this.getSource(uid);
    }
}

export default new MonitiringSourcesServices();