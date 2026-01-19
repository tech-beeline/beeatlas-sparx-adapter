import { GrafanaService } from "../api/resources/index.mjs";
import { E2EProcessesServiceInstance, ScenariosServiceInstance, ObservabilityServiceInstance } from "../api/services/index.mjs";
import { NotImplemented } from "../utils/errors.mjs";
import { migrateSparxRepository } from "../api/repositories/init/index.mjs";


const totalMessages = (seq) => {
    if (!seq?.length)
        return 0;
    let ret = seq.length;
    for (const s of seq) {
        ret += totalMessages(s.sequence);
    }
    return ret;
}
export async function onAppStart() {
    let bi_list = await E2EProcessesServiceInstance.getAll2EScenarios();
    const bi_set = bi_list.reduce((acc, v) => {
        if (!acc[v.uid])
            acc[v.uid] = v;
        return acc;
    }, {})

    bi_list = Object.values(bi_set);

    for (const bi of bi_list) {
        console.log(bi);
        const seq = await ScenariosServiceInstance.getScenarioSequence(bi.uid);
        if (seq.sequence?.length) {
            bi.msg_count = totalMessages(seq.sequence);
            const d = await ObservabilityServiceInstance.getScenarioDashboard(bi.uid);
            bi.dashboard = d.url;
        }
    }

    const max_msg = bi_list.reduce((acc, v) => v.msg_count > acc ? v.msg_count : v, 0);
    const dashboard_count = bi_list.filter(b => b.dashbaord);
    const has_msg = bi_list.filter(b => b.msg_count);
    has_msg.sort((a, b) => a.msg_count - b.msg_count);

    const avg_msg = has_msg.reduce((acc, v) => v.msg_count + acc, 0) / has_msg.length;
    const median_msg = has_msg[has_msg.length >> 1];
    console.log(bi_list);
};
