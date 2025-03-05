import fs from 'fs'

export function readEnv(envPath = './.env.test') {
    if (fs.existsSync(envPath)) {

        const env = fs.readFileSync(envPath).toString();
        for (const v of env.split('\n')) {
            const [key, val] = v.split('=').map(i=>i.trim());
            process.env[key] = val;
        }
        return;
    }
    throw error(`"${envPath}" not found`);
}