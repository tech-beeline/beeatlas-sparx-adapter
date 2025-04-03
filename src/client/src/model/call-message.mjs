export class CallMessage {
    /** @type {string} */
    client_code;
    /** @type {string} */
    client_name;
    /** @type {string} */
    ea_guid;
    /** @type {string} */
    operation_guid;
    /**
     * @type { {name:string, operation_guid:string, api:string, api_code, api_guid}}
     */
    method;
    /** @type {string} */
    stereotype;
    /** @type {string} */
    server_code;
    /** @type {string} */
    server_name;
    /** @type {string} */
    diagram;
    /** @type {number} */
    seqno;
    d_uid;
    /** @type {Array<CallMessage>} */
    children;
}
