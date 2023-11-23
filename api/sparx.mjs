import https from "https"
import pg from 'pg'


const DEFAULT_PG_CONFIG = {
    user: 'fdm_user',
    password: '12fdmuser09',
    host: 'mn-seadb01.vimpelcom.ru',
    database: 'ea_repository'
}

export class SPARXApi {
    static #pgClient;
    static #parseEnviromentConfig() {
        if (!process.env.EA_REPO_DATABASE)
            return null;
        const keys = process.env.EA_REPO_DATABASE.split(';');
        let ret = {};
        for (const s of keys) {
            let [key, value] = s.split('=');
            ret[key] = value;
        }
        if (!ret.user)
            throw Error('reqiure user value in EA_REPO_DATABASE enviroment variable')
        if (!ret.password)
            throw Error('reqiure password value in EA_REPO_DATABASE enviroment variable')
        if (!ret.host)
            throw Error('reqiure host value in EA_REPO_DATABASE enviroment variable')
        if (!ret.database)
            throw Error('reqiure database value in EA_REPO_DATABASE enviroment variable')

        return ret;
    }
    static async pgConnect() {
        const config = this.#parseEnviromentConfig() ?? DEFAULT_PG_CONFIG;
        SPARXApi.#pgClient = new pg.Client(config);
        await client.connect();
    }
    /**
     * 
     * @param {boolean?} all 
     */
    static async getDomains(all){
        if( all ){
            throw Error('not imlemented');
        }
        
    }
}