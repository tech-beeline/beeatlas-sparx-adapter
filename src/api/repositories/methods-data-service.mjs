import t_operation from '../../utils/ea-model/t_operation.mjs'
import Repository from '../../utils/ea-repo.mjs'

const SELECT_BY_INTERFACE_IDS = `select * from t_operation where object_id = ANY($1)`

class MethodsDataService {
    /**
     * 
     * @param {Array} idList 
     * @returns {Promise<Array<t_operation>}
     */
    async selectByInterfaceIds(idList) {
        return Repository.queryRows(SELECT_BY_INTERFACE_IDS, [idList]);
    }
}