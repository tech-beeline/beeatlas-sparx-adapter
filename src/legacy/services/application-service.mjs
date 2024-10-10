import { ApplicationCatalog } from "../model/application-catalog.mjs";
import Repository from '../../api/repositories/sparx-ea-repository/index.mjs';

import applicationCatalog from "./sql/application-catalog.mjs";


class ApplicationCatalogService {
    async getApplications() {
        return new ApplicationCatalog({ providedInterfaces: await Repository.queryRows(applicationCatalog.APPLICATION_QUERY) });
    }
}

export default new ApplicationCatalogService();