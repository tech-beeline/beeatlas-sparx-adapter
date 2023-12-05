import fs from 'fs'
// [ ] - Проработать вариант на использование модулей типа dotenv
const ENV = {
    config : ()=>{
        if (fs.existsSync('./.env.test')) {
            const env = JSON.parse(fs.readFileSync('./.env.test'));
            for (const v in env) {
                process.env[v] = env[v];
            }
        }        
    }
}


ENV.config();

export default ENV 