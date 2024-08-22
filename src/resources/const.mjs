import packageJson from '../../package.json' assert { type: "json" };


export const API_VERSION = packageJson.version;
export const CONTACT = {
    "email": "ivvoronin@beeline.ru"
}

export const APP_CATALOG_ROOT = process.env.APP_CATALOG_ROOT ?? '{7889FE97-8783-4311-B229-3A88F8EFA8E3}';
