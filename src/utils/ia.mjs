import fs from "fs";
import NodeBuffer, { Buffer } from "node:buffer";
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

            if (NodeBuffer.isUtf8(rawContent)) {
                this.yaml = YAML.parse(rawContent.toString('utf-8'));
                return;
            }
            if (NodeBuffer.isAscii(rawContent)) {
                this.yaml = YAML.parse(rawContent.toString('ascii'));
                return;
            }
            this.yaml = YAML.parse(rawContent.toString('utf-16le'));
        } catch (error) {
            this.parseError = error;
        }
    }

}
export class IARepository {
    static CACHE_STATUS_PATH = "./data/ia-cache-status.json";
    static GIT_ARCHIVE = "./data/interface-agreement.zip";
    static CACHE_REFRESH_MS = 3600000;
    static git_base = "https://git.vimpelcom.ru/common/architecture/interface-agreement/-/blob/main";
    static PREFIX_LIST = [
        "", this.git_base
    ];
    static IA_GIT_TOKEN = process.env.IA_GIT_TOKEN;
    static DATA_FOLDER = './data'
    #data;
    #status;
    #cache_load_time;
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
        this.#cache_load_time = Date.now();
        console.log('Interface Agreement loaded from git zip archive');
    }
    async #downloadFromGit() {
        console.log(`download interface agreement from gitlab`);
        if (!fs.existsSync(IARepository.DATA_FOLDER)) {
            console.log('make ./data');
            fs.mkdirSync(IARepository.DATA_FOLDER);
        }
        let p = new Promise((resolve, reject) => {
            try {
                https.get('https://git.vimpelcom.ru/api/v4/projects/common%2Farchitecture%2Finterface-agreement/repository/archive.zip', {
                    headers: {
                        "PRIVATE-TOKEN": IARepository.IA_GIT_TOKEN //[ ] Переделать на ТУЗ и перенести в настройки
                    },
                    rejectUnauthorized: false //[ ] Можно заменить на подстановку сертификата, низкий приоритет
                },
                    response => {
                        try {


                            let file = fs.createWriteStream(IARepository.GIT_ARCHIVE);

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
                        } catch (error) {
                            console.error(error);
                            reject(error);
                        }
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
     * @param {string} path
     * @returns {Promise<InterfaсeAgreement>}
     */
    async byPath(path) {
        if (!this.#data || (Date.now() - this.#cache_load_time) > IARepository.CACHE_REFRESH_MS) {
            if (fs.existsSync(IARepository.GIT_ARCHIVE)) {
                console.log(Date.now() - fs.statSync(IARepository.GIT_ARCHIVE).mtime);
            }
            if (!fs.existsSync(IARepository.GIT_ARCHIVE) || (Date.now() - fs.statSync(IARepository.GIT_ARCHIVE).mtime) > IARepository.CACHE_REFRESH_MS) {
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
        if (!this.IA_GIT_TOKEN) {
            throw Error('IA_GIT_TOKEN not set')
        }
        if (this.#instance)
            return this.#instance;
        this.#instance = new IARepository();
        return this.#instance;
    }
}


export default IARepository;