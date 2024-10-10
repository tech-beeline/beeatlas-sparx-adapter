export {
    t_package,
    t_object,
    t_objectproperties,
    t_connector,
    t_connectortag,
    t_operation,
    t_operationparams,
    t_operationtag,
    t_diagram,
    t_diagramlinks,
    t_diagramobjects,
    t_xref
} from "./ea-model/index.mjs";

import { SparxRepository } from "./ea-repository.mjs";
export { ARCHIMATE_CAPABILITY, CONNECTOR_STEREOTYPES } from "./ea-repository.mjs";
export { SparxRepository }

export const SparxRepositoryInstance = new SparxRepository();
export default SparxRepositoryInstance;

