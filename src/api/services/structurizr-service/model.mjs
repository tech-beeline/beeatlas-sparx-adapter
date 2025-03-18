
export class Component {
    id;
    name;
    /** @type {{"structurizr.dsl.identifier":string, external_name:string, type:string, api_url:string, protocol}} */
    properties;
}
export class Container {
    id;
    /** @type {string} */
    name;
    /**
     * @type { {"structurizr.dsl.identifier":string, external_name:string}}
     */
    properties;
    /** @type {Array<Component>} */
    components;
}
export class SoftwareSystem {
    /** @type {{cmdb}} */
    properties;
    id;
    name;
    /** @type {Array<Container>} */
    containers;
}
class Model {
    /** @type {{ arhcitect, workspace_cmdb}} */
    properties;
    /** @type {Array<SoftwareSystem>} */
    softwareSystems
}
class SystemContextViews {
    softwareSystemId;
    title; s
}

export class Workspace {
    /** @type { Model } */
    model;
    /** @type {{ systemContextViews:Array<SystemContextViews>}} */
    views;
}
