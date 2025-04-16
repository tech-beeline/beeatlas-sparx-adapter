import fdmStorage from "../repositories/fdm-storage.mjs";

const SELECT_USERS = `SELECT
	plugin_user as login
FROM arch_metrics.plugin_actions_stat
GROUP BY plugin_user`;

const SELECT_USER_ACTION_BY_LOGIN = `SELECT
	*
FROM arch_metrics.plugin_actions_stat
WHERE LOWER(plugin_user)=LOWER($1)
`
export class DigitalArchitectRepository {
    /**
     * 
     * @returns {Promise<{login:string}>}
     */
    async selectUsers() {
        return fdmStorage.query(SELECT_USERS);
    }

    /**
     * 
     * @returns {Promise<{login:string}>}
     */
    async selectUserActionsByLogin(login) {
        return fdmStorage.query(SELECT_USER_ACTION_BY_LOGIN, login);
    }
}