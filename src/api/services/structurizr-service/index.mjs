import { sys } from "typescript";
import { NotImplemented } from "../../../utils/errors.mjs";
import { StructurizrRepository } from "../../repositories/index.mjs";
import { Workspace } from "./model.mjs";
import { containerWithoutCode } from "./comments.mjs";


class CheckResult {
    /** @type {"ok"|"error"|warning} */
    result;
    comment;
    /**
    * 
    * @param {"ok"|"error"|"warning"} result 
    * @param {*} comment 
    */
    constructor(result, comment) {

        this.result = result;
        this.comment = comment;
        return this;
    }
}
export class WorkspaceCheckResult {
    /** @type {CheckResult} */
    hasCMDB;
    /** @type { CheckResult}*/
    hasSystem;
    containersResult;
}

export class WorkspaceValidator {
    /** @type {Workspace} */
    workspace;
    constructor(workspace) {
        this.workspace = workspace;
    }
    get cmdb() {
        const cmdb = this.workspace.model.properties?.workspace_cmdb;
        if (cmdb)
            return cmdb
        for (const cv of this.workspace.views?.systemContextViews) {
            const s = this.workspace.model.softwareSystems.find(s => s.id == cv.softwareSystemId);
            if (s && s.properties?.cmdb)
                return s.properties.cmdb;
        }
        return null;
    }
    /**
     * 
     * @returns {CheckResult}
     */
    hasCMDB() {
        let cmdb = this.workspace.model.properties?.workspace_cmdb;
        if (cmdb)
            return new CheckResult("ok", `workspace_cmdb=${cmdb}`);
        for (const cv of this.workspace.views?.systemContextViews) {
            const s = this.workspace.model.softwareSystems.find(s => s.id == cv.softwareSystemId);
            if (s && s.properties?.cmdb)
                return new CheckResult("warning", `В model.properties отсутствует cmdb мнемоника (workspace_code). 
Cmdb мнемоника берется из контекстной диаграммы [${cv.title}], cmdb=${s.properties.cmdb}`);
        }
        return new CheckResult("error", `В model.properties отсутствует cmdb мнемоника (workspace_code)`)
    }
    /** @returns {CheckResult} */
    hasSoftwareSystem() {
        const cmdb = this.cmdb;
        if (cmdb) {
            const systems = this.workspace.model.softwareSystems?.filter(s => s.properties?.cmdb === cmdb);
            if (!systems.length) return new CheckResult("error", `Не найдена sofwareSystem c properties.cmdb=${cmdb}`);
            if (systems.length > 1) return new CheckResult("error", `Найдено ${systems.length} systemSoftware с properties.cmdb=${cmdb}`);
            return new CheckResult("ok", `Система: "${systems[0].name}"`);
        }
    }
    checkContainers() {
        const cmdb = this.cmdb;
        if (!cmdb) return undefined;

        const systems = this.workspace.model.softwareSystems?.filter(s => s.properties?.cmdb === cmdb);
        const result = [];
        for (const system of systems) {
            for (const container of system.containers) {
                const containerId = container.properties?.["structurizr.dsl.identifier"];
                const apiList = container.components?.filter(api => api.properties?.type == "api");
                if (!apiList?.length) {
                    if (!container.properties?.external_name) {
                        result.push(new CheckResult("warning", containerWithoutCode(container, system)));
                    }
                }
                console.log(apiList);
            }
        }
        return result;
    }
    check() {
        const result = new WorkspaceCheckResult();
        result.hasCMDB = this.hasCMDB();
        result.cmdb = this.cmdb;
        result.name = this.workspace?.name;
        result.hasSystem = this.hasSoftwareSystem();
        result.containersResult = this.checkContainers();
        return result;
    }
}

export class StructurizrService {
    repository;
    constructor(repository = new StructurizrRepository()) {
        this.repository = repository;
    }
    async getJsonCheckResult(workspaceId) {
        const workspaceJson = await this.repository.getWorkspaceJson(workspaceId);
        return new WorkspaceValidator(workspaceJson).check();
    }
}