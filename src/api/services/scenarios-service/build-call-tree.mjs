import { NotImplemented } from "../../../utils/errors.mjs";
import { Scenario, ScenarioMessage } from "../../model/scenario/index.mjs";

const EXCLUDE_NAMES = {
    use: true,
    "use()": true
}
/**
 * 
 * @param {ScenarioMessage} context 
 * @param {ScenarioMessage} msg 
 */
function addMessage(context, msg) {
    const message_display = (message = msg) => `${message.uid} ${message.client_name}->${message.server_name || ""}:"${message.name || ""}"`;
    const message_skip = (text) => `Пропускаем сообщение ${message_display()} : ${text || ""}`
    if (msg.is_ret == '1')
        return context.addInfoMessage(message_skip("возрат"));
    if (EXCLUDE_NAMES[msg.name])
        return context.addInfoMessage(message_skip(`информационное сообщение`));
    if (msg.server_id == msg.client_id)
        return context.addInfoMessage(message_skip(`внутренниый вызов самого себя`));
    if (context.server_id == 0 || msg.client_id == context.server_id) {
        context.addScenarioMessage(msg);
        console.log(`Добавлено сообщение ${message_display()}`);
        return msg;
    }
    context.addInfoMessage(`Предполагается, что этот вызов листовой`);
    msg.addInfoMessage(`Поднимаемся по иерархии вызовов для поиска нужного клиента`)
    while (context.context && context.server_id != msg.client_id)
        context = context.context;

    msg.addInfoMessage(`Ближайший подхлодящий контекст: ${message_display(context)}`);
    context.addScenarioMessage(msg);
    console.log(`Добавлено сообщение ${message_display()}`);
    return msg;
}
/**
 * 
 * @param {Scenario} scenario 
 * @returns 
 */
export function buildCallTree(scenario) {
    console.log(`Строим дерево для каждой диграммы`)
    for (const d of scenario.diagrams.toArray()) {
        d.messages.sort((a, b) => a.seqno - b.seqno);

        console.log(`Обработка диаграммы [${d.uid}] "${d.name}"`);


        let context = new ScenarioMessage({ server_id: 0, sequence: d.sequence });
        for (const msg of d.messages) {
            context = addMessage(context, msg);
        }
    }
    console.log(`Подключем в контексты дочерние диаграммы`);
    for (const msg of scenario.messages) {
        if (msg.linked_diagram_uid) {
            if (msg.linked_diagram_uid == msg.diagram_uid) {
                console.log(`На диаграмме c UID=${msg.diagram_uid} есть объект ${msg.server_name}, который ссылается на ту же диаграмму`);
                continue;
            }
            const diagram = scenario.diagrams.get(msg.linked_diagram_uid);
            if (!diagram)
                throw Error(`Не найдена диаграмма с UID=${msg.linked_diagram_uid} (объект ${msg.server_name}, диаграмма ${msg.diagram?.name} uid=${msg.diagram_uid}  )`);

            if (!msg.operation_guid) {
                msg.addInfoMessage(`Сообщение не связано с методом operation_guid`);
                let ctx = msg.context;
                while (ctx && !ctx.operation_guid) {
                    ctx = ctx.context;
                }
                if (!ctx) {
                    msg.addValidationError(`Не найден operation_guid по всей цевочке вызовов`);
                    continue;
                }
            }
        }
    }
    return scenario;
}