
export const addMethod = (it, { name, rps, latency, error_rate, tc }) => {
    let m = JSON.parse(JSON.stringify({
        name: name,
        rps: rps ?? undefined,
        latency: latency ?? undefined,
        error_rate: error_rate ?? undefined,
        implements: tc ?? undefined
    }));
    (it.methods = it.methods ?? []).push(m);
}

/**
 * 
 * @param {{code, interfaces:[]}} c 
 * @param {{ name, localCode}} it 
 */
export const addApi = (c, { name, localCode } = {}) => {
    let it = {
        name: name,
        code: `${localCode}.${c.code}`,
        status: "Proposed",
        version: "1.0"
    };
    (c.interfaces = c.interfaces ?? []).push(it);
    return it;
}
/**
 * 
 * @param {{code,containers:[] }} s 
 * @param {*} c
 */
export const addContainer = (s, { name, localCode }) => {
    let c = {
        name: name,
        code: `${localCode}.${s.code}`,
        status: "Proposed",
        version: "1.0"
    };
    (s.containers = s.containers ?? []).push(c);
    return c;
}
