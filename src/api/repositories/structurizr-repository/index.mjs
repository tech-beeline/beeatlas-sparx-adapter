import { NotImplemented } from "../../../utils/errors.mjs";
import { get, getJSON } from "../../../utils/http-request-promise.mjs";


const DEFAULT_OPTIONS = {
    rejectUnauthorized: false
}
export class StructurizrRepository {
    url;
    constructor(url = "https://structurizr.vimpelcom.ru/") {
        this.url = url;
    }
    async getWorkspaceJson(workspaceId) {
        return getJSON(`${this.url}share/${workspaceId}/json`, DEFAULT_OPTIONS);
    }

    async getWorkspaceDSL(workspaceId) {

        return get(`${this.url}share/${workspaceId}/dsl`, DEFAULT_OPTIONS).then(b=>b.toString());
    }
}