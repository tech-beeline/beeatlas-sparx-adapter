export async function loadTC(code) {
    const req = await fetch(`/api/v4/tc/${encodeURIComponent(code)}`);
    if (!req.ok) {
        throw Error(await req.text());
    }
    return req.json();
}

const tcCache = {};
export class TCService {
    
    async getByCode(code) {
        if (!code) return null;
        code = code.toLowerCase();
        if (tcCache[code]) 
            return tcCache[code];
        return (tcCache[code] = loadTC(code));
    }
}

export const tcService = new TCService();