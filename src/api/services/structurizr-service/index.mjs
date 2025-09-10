import { StructurizrRepository, SystemsRepository, TechnicalCapabilitiesRepository } from "../../repositories/index.mjs";
import { Workspace } from "./model.mjs";
import { apiContainerWithoutCode, noCmdbError, cmdbWarning, containerWithoutCode, noSystemComment, WorkspaceCheckResult, systemNotFound, apiCandidateComment, tooManySystems, apiWithoutExternalName, apiWithoutSpecification, scriptLineComment, scriptNotFoundComment, apiWithWrongTC } from "./comments.mjs";
import { NotImplemented } from "../../../utils/errors.mjs";
import fdmStorage from "../../repositories/fdm-storage.mjs";


const tcRepositoiry = new TechnicalCapabilitiesRepository();

export class WorkspaceValidator {
    /** @type {Workspace} */
    workspaceJson;
    /** @type {string} */

    workspaceDSL;
    constructor(workspaceJson, workspaceDSL) {
        this.workspaceJson = workspaceJson;
        this.workspaceDSL = workspaceDSL;
    }

    get cmdb() {
        const cmdb = this.workspaceJson.model.properties?.workspace_cmdb;
        if (cmdb)
            return cmdb
        for (const cv of this.workspaceJson.views?.systemContextViews ?? []) {
            const s = this.workspaceJson.model.softwareSystems.find(s => s.id == cv.softwareSystemId);
            if (s && s.properties?.cmdb)
                return s.properties.cmdb;
        }
        return null;
    }


    async checkContainers() {
        let cmdb = this.workspaceJson.model.properties?.workspace_cmdb;
        const result = [];

        if (!cmdb) {
            for (const cv of this.workspaceJson.views?.systemContextViews ?? []) {
                const s = this.workspaceJson.model.softwareSystems.find(s => s.id == cv.softwareSystemId);
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


        const systems = this.workspaceJson.model.softwareSystems?.filter(s => s.properties?.cmdb === cmdb);
        if (!systems.length) {
            result.push(systemNotFound(cmdb));
            return result;
        }

        result.preview = { cmdb: cmdb, containers: [] };


        if (systems.length > 1) {
            result.push(tooManySystems(systems));
        }

        for (const system of systems) {
            result.preview.name = system.name;

            const containers = system.containers?.filter(c => c.properties?.source !== 'landscape') ?? [];

            for (const container of containers) {
                const containerId = container.properties?.["structurizr.dsl.identifier"];

                const previewContainer = container.properties?.external_name && {
                    name: container.name,
                    code: `${container.properties.external_name}.${result.preview.cmdb}`,
                    interfaces: []
                };

                if (previewContainer) result.preview.containers.push(previewContainer);

                const apiList = container.components?.filter(api => api.properties?.type == "api");
                if (!apiList?.length) { // у контейнера нет API
                    if (!previewContainer) {
                        result.push(containerWithoutCode(container, system));
                    }
                }
                // у контейнера есть API
                if (apiList?.length) {
                    if (!previewContainer)
                        result.push(apiContainerWithoutCode(container, system));
                    else
                        for (const api of apiList) {
                            const previewApi = api.properties?.external_name && {
                                name: api.name,
                                code: `${api.properties.external_name}.${previewContainer.code}`,
                                api_url: api.properties.api_url,
                                identifier: api.properties["structurizr.dsl.identifier"],
                                tc: api.properties.tc
                            }
                            if (previewContainer && previewApi) {
                                previewContainer.interfaces.push(previewApi);
                                if (!previewApi.api_url) {
                                    result.push(apiWithoutSpecification(system, container, api));
                                }
                                if (previewApi.tc) {
                                    const tcRows = await tcRepositoiry.selectTCByCode(previewApi.tc);
                                    if (!tcRows.length) {
                                        result.push(apiWithWrongTC(system, container, api));
                                        result.preview.fail = `Ничего не будет загруждено, так как есть API с не правильным ТС`
                                    }
                                }
                            }

                            if (!previewApi) {
                                result.push(apiWithoutExternalName(system, container, api));
                            }
                        }
                }

                const apiCandidates = container.components?.filter(api => api.properties?.type != "api"
                    && (api.properties?.api_url || api.properties?.external_name));

                for (const condidate of apiCandidates ?? []) {
                    result.push(apiCandidateComment(system, container, condidate));
                }
            }
        }

        const dslLines = this.workspaceDSL.split('\n');
        const modelStartLine = dslLines.findIndex(l => l.match(/\s*model/));

        let brCnt = 0;
        let modelEndLine;
        for (modelEndLine = modelStartLine; modelEndLine < dslLines.length; modelEndLine++) {
            const line = dslLines[modelEndLine];
            for (const ch of line) {
                if (ch === '{') {
                    brCnt++;
                }
                if (ch == '}') {
                    brCnt--;
                    if (!brCnt) break;
                }
            }
            if (!brCnt) break;
        }

        const slaScriptLine = dslLines.findIndex(l => l.match(/^\s*!script\s+process-sla.groovy/));
        if (slaScriptLine < 0) {
            result.push(scriptNotFoundComment()); 6
        }
        if (slaScriptLine > 0 && slaScriptLine < (modelEndLine - 5)) {
            result.push(scriptLineComment());
        }

        return result;
    }
    async check() {
        const result = new WorkspaceCheckResult();
        result.cmdb = this.cmdb;
        result.name = this.workspaceJson?.name;
        result.comments = await this.checkContainers();
        result.preview = result.comments.preview;
        delete result.comments.preview;

        return result;
    }
}

export class StructurizrService {
    repository;
    constructor(repository = new StructurizrRepository()) {
        this.repository = repository;
    }
    async getJsonCheckResult(workspaceId) {
        const [workspaceJson, workspaceDSL] = await Promise.all([
            this.repository.getWorkspaceJson(workspaceId),
            this.repository.getWorkspaceDSL(workspaceId)]);
        return (new WorkspaceValidator(workspaceJson, workspaceDSL)).check();
    }
    async getProduct(code) {
        const result =await  fdmStorage.query("SELECT alias, git_url, structurizr_workspace_name, structurizr_api_url FROM product.product WHERE LOWER(alias)=LOWER($1)", code);
        if( result.length ) return result[0];
        return null
    }
}