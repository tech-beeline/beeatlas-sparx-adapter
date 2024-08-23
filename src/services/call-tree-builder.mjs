import { ERROR_INFO, OPERATION_GUID_NOT_FOUND } from "../client/src/Components/message-validate-errors.mjs";
import { NotImplemented } from "../utils/errors.mjs";


export function onError(msg, type) {
    console.warn(type);
    msg.errors ?? (msg.errors = []).push(type)
}

export class CallMessage {
    name;
    operation_guid;
    client_code;
    client_name;
    server_code;
    server_name;
    #server;
    #client;
    #childDiagram;
    stereotype;
    children = [];
    errors;
    d_uid;
    diagram;
    rps;
    latency;
    error_rate;
    method;
    ea_guid;
    seqno;
    ia;
    constructor(obj) {
        if (!obj) return;
        for (const fld in this) {
            if (obj[fld]) this[fld] = obj[fld];
        }
        this.server_code = obj.server?.code;
        this.client_code = obj.client?.code;
        this.client_name = obj.client?.name;
        this.server_name = obj.server?.name;
    }
}

export default class CallTreeBuilder {
    /**
     * 
     * @param {Array<{seqno, name, d_uid, childDiagram, child : []}>} messages 
     * @returns 
     */
    static setParents(messages) {

        let context = null;
        for (let m of messages) {
            m.child = [];

            if (context?.d_uid !== m.d_uid) {
                context = m
                continue;
            }

            if (context.server_id != m.client_id) {
                m.is_leaf = true;
            }
            // back trace
            while (context && context.server_id != m.client_id) {
                context = context.parent;
            }

            if (context) {
                context.child.push(m);
                m.parent = context;
                context = m;
                continue;
            }
            context = m
        }
        return messages;
    }


    /**
     * 
     * @param {{ name, d_uid, childDiagram, operation_guid, server : { name, code, object_type}, client : {code, name}}} message 
     */
    static build(message, lastOperationGuid) {
        const { name, operation_guid, server, client, child, childDiagram, d_uid } = message;
        if (childDiagram && server?.object_type == 'Object' && childDiagram.diagram_uid !== d_uid) {
            const op_guid = operation_guid ?? lastOperationGuid;
            if (!op_guid) {
                onError(message, `На родительской диаграмме нельзя определить, какой метод искать на поддиаграмме`)
                return [new CallMessage(message)];
            }
            const method = childDiagram.messages.find(m => m.operation_guid == op_guid);
            if (!method) {
                onError(message, 'На дочерней диаграмме не найден метод ')
                return [new CallMessage(message)]
            }
            if (method.server?.code == client.code) {
                // Внутренний вызов системы с переносом на другую диаграмму (на поддиаграмме первый вызов той же системы)
                return method.child.reduce((ret, v) => [...ret, ...this.build(v, op_guid)], []);
            }

            if (method.server != server) {
                //onError(message, 'На родительской диаграмме объект не явля')
                console.warn( 'method.server != server')
                // Вызов при котором на дочерней диаграмме первый вызов того же обьекта, что и последний на родительской
            }
            let child_of_child = method.child.reduce((res, v) => [...res, ...v.child], [])
            return child_of_child.reduce((ret, v) => [...ret, ...this.build(v, op_guid)], []);

            NotImplemented();
        }
        if (client?.code != server?.code) {
            const tmp = child.reduce((ret, v) => [...ret, ...this.build(v, operation_guid ?? lastOperationGuid)], []);
            if (!operation_guid) {
                onError(message, OPERATION_GUID_NOT_FOUND);
            }
            return [new CallMessage(Object.assign({}, message, { children: tmp }))]
        }
        if (client?.code == server?.code) {
            return child.reduce((ret, v) => [...ret, ...this.build(v, operation_guid ?? lastOperationGuid)], []);
        }
        NotImplemented();
    }

    static attachSubSequences(message, callStack = [], lastOperationUID) {
        const { server, client, childDiagram, d_uid, children, operation_guid } = message;
        if (childDiagram && server?.object_type == 'Object' && childDiagram.diagram_uid !== d_uid) {
            // Надо подтянуть вызовы из дочерней диаграммы
            const op_guid = operation_guid ?? lastOperationUID;
            if (!op_guid) {
                onError(message, `На родительской диаграмме нельзя определить, какой метод искать на поддиаграмме`)
                return message;
            }
            const method = childDiagram.messages.find(m => m.operation_guid == op_guid)
            if (!method) {
                onError(message, 'На дочерней диаграмме не найден метод ')
                NotImplemented();
            }
            if (method.server.code !== client.code) {
                NotImplemented();
            }
            return method.children;
        }
        if (childDiagram && childDiagram.diagram_uid !== d_uid) {
            console.log('!')
            NotImplemented();
        }

        for (let m of children) {
            const tmp = this.attachSubSequences(m, [...callStack, message], operation_guid ?? lastOperationUID)
            console.log(tmp)
        }
        NotImplemented();
    }
}