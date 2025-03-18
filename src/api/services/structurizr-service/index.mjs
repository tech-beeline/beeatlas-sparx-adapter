import { StructurizrRepository, SystemsRepository } from "../../repositories/index.mjs";
import { Workspace } from "./model.mjs";
import { apiContainerWithoutCode, noCmdbError, cmdbWarning, containerWithoutCode, noSystemComment, WorkspaceCheckResult, systemNotFound, apiCandidateComment, tooManySystems, apiWithoutExternalName } from "./comments.mjs";
import { NotImplemented } from "../../../utils/errors.mjs";



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
        for (const cv of this.workspace.views?.systemContextViews ?? []) {
            const s = this.workspace.model.softwareSystems.find(s => s.id == cv.softwareSystemId);
            if (s && s.properties?.cmdb)
                return s.properties.cmdb;
        }
        return null;
    }
    async checkContainers() {
        let cmdb = this.workspace.model.properties?.workspace_cmdb;
        const result = [];

        if (!cmdb) {
            for (const cv of this.workspace.views?.systemContextViews ?? []) {
                const s = this.workspace.model.softwareSystems.find(s => s.id == cv.softwareSystemId);
                if (s && s.properties?.cmdb) {
                    result.push(cmdbWarning(s, cv));
                    cmdb = s.properties.cmdb;
                    break;
                }
            }
            if (!cmdb) {
                result.push(noCmdbError());
                return result;
            }
        }

        const fdmSystem = await new SystemsRepository().selectSystemByCode(cmdb);
        if (!fdmSystem) {
            result.push(noSystemComment(cmdb));
            return result;
        }

        const systems = this.workspace.model.softwareSystems?.filter(s => s.properties?.cmdb === cmdb);
        if (!systems.length) {
            result.push(systemNotFound(cmdb));
            return result;
        }

        if (systems.length > 1) {
            result.push(tooManySystems(systems));
        }

        for (const system of systems) {
            for (const container of system.containers ?? []) {
                const containerId = container.properties?.["structurizr.dsl.identifier"];
                const apiList = container.components?.filter(api => api.properties?.type == "api");
                if (!apiList?.length) { // у контейнера нет API
                    if (!container.properties?.external_name) {
                        result.push(containerWithoutCode(container, system));
                    }
                }
                // у контейнера есть API
                if (apiList?.length) {
                    if (!container.properties?.external_name) result.push(apiContainerWithoutCode(container, system));
                    for (const api of apiList) {
                        if (!api.properties.external_name) {
                            result.push(apiWithoutExternalName(system, container, api));
                        }
                    }
                }
                const apiCandidates = container.components?.filter(api => api.properties?.type != "api" && (api.properties?.api_url || api.properties?.external_name));
                for (const condidate of apiCandidates ?? []) {
                    result.push(apiCandidateComment(system, container, condidate));
                }
            }
        }
        return result;
    }
    async check() {
        const result = new WorkspaceCheckResult();
        result.cmdb = this.cmdb;
        result.name = this.workspace?.name;
        result.comments = await this.checkContainers();
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