import client from 'prom-client'
import { bootstrapAPI } from '../bootstrap.mjs';
import { ArchMetricsRepository } from '../repositories/index.mjs';
import { PluginAction } from '../repositories/arch-metrics-repository/model.mjs';
import { NotImplemented } from '../../utils/errors.mjs';


const ACTION_REFRESH_TIME = 180;
let EXPIRATION_TIME = Date.now() + ACTION_REFRESH_TIME * 1000;

const PLUGIN_USERS = {}

export const C4StartCounter = new client.Counter({
    name: 'vscode_c4_plugin_start',
    help: 'Количество запусков плагина',
    labelNames: ['version', 'action', 'user', 'template_id', 'cmdb', 'element_uid']
});

export const C4PluginUsersCounter = new client.Counter({
    name: 'vscode_c4_plugin_users',
    help: 'Количество пользователей',
    labelNames: []
});

export function processPluginUser(user) {
    if (PLUGIN_USERS[user]) return;
    PLUGIN_USERS[user] = user;
    C4PluginUsersCounter.inc();
}

export function registerC4PluginStart(version, action = 'start', user, template_id) {
    ArchMetricsRepository.onPluginAction(version, action, user, template_id); // Асинхронно обновляем базу данных метрик
    C4StartCounter.inc({ version: version, action: action, user: user, template_id: template_id });
    processPluginUser(user);
}

async function refreshPluginStat() {
    C4StartCounter.reset();
    ArchMetricsRepository.initPluginActionCounter((version, action, user, template_id, cmdb, element_uid, value) => {
        C4StartCounter.inc({ version: version, action: action, user: user, template_id: template_id, cmdb: cmdb, element_uid: element_uid }, value);
        processPluginUser(user);
    });
}

/**
 * 
 * @param {PluginAction} action 
 */
export function registerC4PluginEvent(action) {
    action.user = action.user?.toLowerCase()??"unknown";
    ArchMetricsRepository.insertPluginAction(action); // Асинхронно обновляем базу данных метрик
    C4StartCounter.inc({
        version: action.version,
        action: action.action,
        user: action.user,
        template_id: action.template_id,
        cmdb: action.cmdb,
        element_uid: action.element_uid
    });
    processPluginUser(action.user);
    if (EXPIRATION_TIME < Date.now()) {
        EXPIRATION_TIME = Date.now() + ACTION_REFRESH_TIME * 1000;
        refreshPluginStat();
    }
}

bootstrapAPI.addTask(refreshPluginStat);