import fs from "fs";
import https from "https"
import zipStream from "node-stream-zip"
import YAML from "yaml";

export class InterfaсeAgreement {
    raw;
    yaml;
    parseError;
    /**
     * 
     * @param {Buffer} rawContent 
     */
    constructor(rawContent) {
        this.raw = rawContent;
        try {
            this.yaml = YAML.parse(rawContent.toString());
        } catch (error) {
            this.parseError = error;
        }
    }
}
export class IARepository {
    static CACHE_STATUS_PATH = "./data/ia-cache-status.json";
    static GIT_ARCHIVE = "./data/interface-agreement.zip";
    static git_base = "https://git.vimpelcom.ru/common/architecture/interface-agreement/-/blob/main";
    static PREFIX_LIST = [
        "", this.git_base
    ];
    #data;
    #status;
    constructor() {
    }
    async #loadData() {

        const zip = new zipStream.async({ file: IARepository.GIT_ARCHIVE });
        console.log(`entry count = ${await zip.entriesCount}`);
        const entries = await zip.entries();
        this.#data = {};

        for (const entry of Object.values(entries)) {
            if (entry.isFile && (entry.name.toLowerCase().endsWith('.yaml') || entry.name.toLowerCase().endsWith('.yml'))) {
                const name = entry.name.split('/').slice(1).join('/')
                const ia = new InterfaсeAgreement(await zip.entryData(entry.name));
                for (const prefix of IARepository.PREFIX_LIST) {
                    this.#data[`${prefix}/${name.toLowerCase()}`] = ia;
                }
            }
        }

        zip.close();
        console.log('Interface Agreement loaded from git zip archive');
    }
    async #downloadFromGit() {
        let p = new Promise((resolve, reject) => {
            try {

                https.get('https://git.vimpelcom.ru/api/v4/projects/common%2Farchitecture%2Finterface-agreement/repository/archive.zip', {
                    headers: {
                        "PRIVATE-TOKEN": "rLGUxyyR9aGxCkxKpP2W" //TODO Переделать на ТУЗ и перенести в настройки
                    },
                    rejectUnauthorized: false //TODO Можно заменить на подстановку сертификата, низкий приоритет
                },
                    response => {
                        let file = fs.createWriteStream(IARepository.GIT_ARCHIVE);
                        console.log(response);

                        if (response.statusCode !== 200) {
                            reject(Error(`HTTP ${response.statusCode} : ${response.statusMessage}`));
                            return;
                        }

                        file.on('finish', () => {
                            resolve();
                        });

                        response.pipe(file);

                        response.on('finish', (data) => {
                            console.log('Interface Agreement downloaded from git')
                            resolve();
                        })
                            .on('error', (err) => {
                                console.error(err);
                                reject(err);
                            });
                    }).on('error', (e) => reject(e)).end();
            } catch (ex) {
                console.error(ex);
                reject(ex);
            }
        });
        return p;
    }
    /**
     * 
     * @param {string} path 
     * @returns {Promise<boolean>}
     */
    async isExists(path) {
        const ia = await this.byPath(path);
        return ia != null;
    }

    /**
     * 
     * @param {string} path 
     * @returns {Promise<InterfaсeAgreement>}
     */
    async byPath(path) {
        if (!this.#data) {
            if (!fs.existsSync(IARepository.GIT_ARCHIVE)) {
                await this.#downloadFromGit();
            }
            await this.#loadData();
        }
        return this.#data[path.toLowerCase()];
    }
    static #instance = null;
    /**
     * @returns {IARepository}
     */
    static get Instance() {
        if (this.#instance)
            return this.#instance;
        this.#instance = new IARepository();
        return this.#instance;
    }
}
