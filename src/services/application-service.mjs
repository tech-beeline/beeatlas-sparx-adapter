import { ApplicationCatalog } from "../model/application-catalog.mjs";
import Repository from "../utils/ea-repo.mjs";
import applicationCatalog from "./sql/application-catalog.mjs";


class ApplicationCatalogService {
    async getApplications() {
        return new ApplicationCatalog({ providedInterfaces: await Repository.queryRows(applicationCatalog.APPLICATION_QUERY) });
    }
}

export default new ApplicationCatalogService();