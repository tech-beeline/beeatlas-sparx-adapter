import GrafanaSource from "../GrafanaSource.mjs";


export class InterfaceApiMonitoring{
    code;
    name;
    tcCode;
    tcName;
    /**
     * @type {GrafanaSource}
     */
    source;
}


export class ContainerApiMonitoring{
    code;
    name;
    /**
     * @type {GrafanaSource}
     */
    source;

    /**
     * @type {Array<InterfaceApiMonitoring>}
     */
    interfaces;
}

export class SystemApiMonitoring {
    systemCode;
    /**
     * @type {GrafanaSource}
     */
    source;
    /**
     * @type {Array<ContainerApiMonitoring}
     */
    containers;
    providedInterfaces;
}

export default SystemApiMonitoring;