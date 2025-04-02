import fs from 'fs'
import fdmStorage from '../src/api/repositories/fdm-storage.mjs';

export function readEnv(envPath = './.env.test') {
    if (fs.existsSync(envPath)) {
        const envFile = fs.readFileSync(envPath).toString();
        const env = {}
        for (const v of envFile.split('\n')) {
            const [key, val] = v.split('=').map(i => i.trim());
            env[key] = val;
        }
        return env;
    }
    throw error(`"${envPath}" not found`);
}

export function updateEnv(envPath) {
    for (const [key, val] of Object.entries(readEnv(envPath))) {
        process.env[key] = val;
    }
    fdmStorage.config();
}