import { NotImplemented } from "../../../utils/errors.mjs";
import { Scenario, ScenarioDiagram, ScenarioMessage } from "../../model/scenario/index.mjs";

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
    const message_skip = (text) => `Пропускаем сообщение ${msg.display()} : ${text || ""}`
    if (msg.is_ret == '1')
        return context.addInfoMessage(message_skip("возрат"));
    if (EXCLUDE_NAMES[msg.name?.toLowerCase()])
        return context.addInfoMessage(message_skip(`информационное сообщение`));
    if (msg.server_id == msg.client_id)
        return context.addInfoMessage(message_skip(`внутренниый вызов самого себя`));
    if (context.server_id == 0 || msg.client_id == context.server_id) {
        context.addScenarioMessage(msg);
        console.log(`Добавлено сообщение ${msg.display()}`);
        return msg;
    }
    context.addInfoMessage(`Предполагается, что этот вызов листовой`);
    msg.addInfoMessage(`Поднимаемся по иерархии вызовов для поиска нужного клиента`)
    while (context.context && context.server_id != msg.client_id)
        context = context.context;

    msg.addInfoMessage(`Ближайший подхлодящий контекст: ${context.display()}`);
    context.addScenarioMessage(msg);
    console.log(`Добавлено сообщение ${msg.display()}`);
    return msg;
}

/**
 * 
 * @param {ScenarioMessage} msg 
 * @param {ScenarioDiagram} diagram 
 * @returns 
 */
function tryAddSubDiagrmamEntry(msg, diagram) {
    /** @type {ScenarioMessage} */
    const diagram_entry = diagram.sequence.find(m => m.operation_guid === msg.operation_guid);
    if (!diagram_entry) {
        msg.addValidationError(`Не удалось найти метод ${msg.method?.name || msg.name} с operation_guid=${msg.operation_guid} на диаграмме ${diagram.name}, uid=${diagram.uid}`);
        return;
    }
    msg.subdiagramsEntries.push(diagram_entry);
    msg.addInfoMessage(`Добавлены вызовы из сообщения ${diagram_entry.display(true)}`);
}

/**
 * 
 * @param {ScenarioMessage} msg 
 */
function removeInternalMessages(msg) {
    if (!msg.sequence)
        return;
    const sequence = [];
    const skip_message = (m) => {
        // [ ] Подумать про упрощение
        if (m.server?.app_code === msg.server?.app_code || m.operation_guid === msg.operation_guid || !m.server?.app_code) {
            m.operation_guid = msg.operation_guid;
            m.server = msg.server;
        }

        removeInternalMessages(m);

        m.sequence && sequence.push(...m.sequence);
        if (m.validationError) {
            for (const e of m.validationError) {
                msg.addValidationError(`Из дочерного вызова ${m.display()}:\n${e}`);
            }
        }
    };
    const add_message = (m) => {
        removeInternalMessages(m);
        sequence.push(m);
    }
    for (const ch of msg.sequence) {
        if (msg.app_front && !ch.method) {
            ch.app_front = 1;
            skip_message(ch);
            continue;
        }

        if (ch.method?.app_front) {
            skip_message(ch);
            continue;
        }
        if (ch.method?.show_in_e2e && msg.operation_guid != ch.operation_guid) {
            add_message(ch);
            continue;
        }

        if (ch.server?.app_code === msg.server?.app_code ||
            ch.operation_guid === msg.operation_guid ||
            !ch.server?.app_code) {
            skip_message(ch);
        }
        else
            add_message(ch);
    }
    msg.sequence = sequence.length ? sequence : undefined;
}
/**
 * 
 * @param {Scenario} scenario 
 * @returns 
 */
export function buildCallTree(scenario, removeInfoMessages = false, removeError = false) {
    console.log(`Строим дерево для каждой диграммы`)
    for (const d of scenario.diagrams.toArray()) {
        d.messages.sort((a, b) => a.seqno - b.seqno);

        console.log(`Обработка диаграммы [${d.uid}] "${d.name}"`);


        let context = new ScenarioMessage({ server_id: 0, sequence: d.sequence, client_name: "Пользователь", name: "Вход в диаграмму", server_name: d.name });
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
            /** @type {ScenarioDiagram} */
            const diagram = scenario.diagrams.get(msg.linked_diagram_uid);
            if (!diagram) {
                msg.addValidationError(`Не найдена диаграмма с UID=${msg.linked_diagram_uid} или на этой диаграмме нет взаимодействий (объект ${msg.server_name}, диаграмма ${msg.diagram?.name} uid=${msg.diagram_uid} )`);
                continue;
                //throw Error(`Не найдена диаграмма с UID=${msg.linked_diagram_uid} (объект ${msg.server_name}, диаграмма ${msg.diagram?.name} uid=${msg.diagram_uid}  )`);
            }


            if (!msg.operation_guid) {
                msg.addValidationError(`Сообщение ${msg.display()} не связано с методом operation_guid, при этом есть связь с дочерней диагаммой ${diagram.name}.\nИщем сообщшение с operation_guid выше по цепочке вызовов`);
                let ctx = msg.context;
                while (ctx && !ctx.operation_guid) {
                    ctx = ctx.context;
                }
                if (!ctx) {
                    msg.addValidationError(`Не найден operation_guid по всей цевочке вызовов, нельзя подключиться к диаграмме ${diagram.name} uid=${diagram.uid}`);
                    continue;
                }
                msg.addInfoMessage(`Найдено сообщение ${ctx.display()}, пытаемся к нему подключить дочернюю диаграмму`);
                tryAddSubDiagrmamEntry(ctx, diagram);
                continue;
            }
            tryAddSubDiagrmamEntry(msg, diagram);
        }
    }

    console.log(`Подключаем сообщения из дочерних диаграмм`);

    for (const msg of scenario.messages) {
        const subentries = msg.subdiagramsEntries;
        if (!subentries.length)
            continue;
        if (subentries.length > 1) {
            msg.addValidationError(`У данного сообщения по цепочке вызовов найдено несколько возможных дочерних`);
        }
        if (!msg.sequence)
            msg.sequence = [];
        else
            msg.sequence.length = 0;
        for (const s of subentries) {
            if (s.sequence && s.sequence.length) msg.sequence.push(...s.sequence);
        }
    }

    console.log(`Схлопываем сообщения внутри одного приложения`);
    const final_sequence = []
    for (const msg of scenario.diagrams.get(scenario.uid)?.sequence || []) {
        const ctx = new ScenarioMessage();
        ctx.sequence = [msg];
        ctx.app_front = 1;

        removeInternalMessages(ctx);
        final_sequence.push(...ctx.sequence ?? []);
    }

    scenario.diagrams.get(scenario.uid).sequence = final_sequence;

    if (removeInfoMessages || removeError) {
        for (const msg of scenario.messages) {
            if (removeInfoMessages) msg.infoMessages = undefined;
            if (removeError) msg.validationError = undefined;
        }
    }
    return scenario;
}