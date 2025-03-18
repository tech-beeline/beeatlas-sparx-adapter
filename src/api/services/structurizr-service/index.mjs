import { StructurizrRepository, SystemsRepository } from "../../repositories/index.mjs";
import { Workspace } from "./model.mjs";
import { CMDB_ERROR, cmdbWarning, containerWithoutCode, noSystemComment } from "./comments.mjs";

class CheckResult {
    /** @type {"ok"|"error"|warning} */
    level;
    comment;
    /**
    * 
    * @param {"ok"|"error"|"warning"} level 
    * @param {*} comment 
    */
    constructor(level, comment) {

        this.level = level;
        this.comment = comment;
        return this;
    }
}
export class WorkspaceCheckResult {
    /** @type {CheckResult} */
    cmdbError;
    containersComments;
}

function errorComment(comment) {
    return new CheckResult("error", comment);
}
function warningComment(comment) {
    return new CheckResult("warning", comment);
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
    cmdbError() {
        let cmdb = this.workspace.model.properties?.workspace_cmdb;
        if (cmdb)
            return null;
        for (const cv of this.workspace.views?.systemContextViews) {
            const s = this.workspace.model.softwareSystems.find(s => s.id == cv.softwareSystemId);
            if (s && s.properties?.cmdb)
                return new CheckResult("warning", `В model.properties отсутствует cmdb мнемоника (workspace_code). 
Cmdb мнемоника берется из контекстной диаграммы [${cv.title}], cmdb=${s.properties.cmdb}`);
        }
        return errorComment(CMDB_ERROR);
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
    async checkContainers() {
        let cmdb = this.workspace.model.properties?.workspace_cmdb;
        const result = [];

        if (!cmdb) {
            for (const cv of this.workspace.views?.systemContextViews) {
                const s = this.workspace.model.softwareSystems.find(s => s.id == cv.softwareSystemId);
                if (s && s.properties?.cmdb) {
                    result.push(warningComment(cmdbWarning(s, cv)));
                    cmdb = s.properties.cmdb;
                }
            }
            if (!cmdb) {
                result.push(errorComment(CMDB_ERROR));
                return result;
            }
        }

        const fdmSystem = await new SystemsRepository().selectSystemByCode(cmdb);
        if (!fdmSystem) {
            result.push(errorComment(noSystemComment(cmdb)));
            return result;
        }

        const systems = this.workspace.model.softwareSystems?.filter(s => s.properties?.cmdb === cmdb);
        if (!systems.length) {
            result.push(errorComment(noSystemComment(cmdb)));
            return result;
        }

        for (const system of systems) {
            for (const container of system.containers) {
                const containerId = container.properties?.["structurizr.dsl.identifier"];
                const apiList = container.components?.filter(api => api.properties?.type == "api");
                if (!apiList?.length) { // у контейнера нет API
                    if (!container.properties?.external_name) {
                        result.push(warningComment(containerWithoutCode(container, system)));
                    }
                    continue;
                }
                // у контейнера есть API
                if (!container.properties?.external_name) {
                    result.push(errorComment());
                }
            }
        }
        return result;
    }
    async check() {
        const result = new WorkspaceCheckResult();
        result.cmdb = this.cmdb;
        result.name = this.workspace?.name;
        result.containersComments = await this.checkContainers();
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
        return (new WorkspaceValidator(workspaceJson)).check();
    }
}