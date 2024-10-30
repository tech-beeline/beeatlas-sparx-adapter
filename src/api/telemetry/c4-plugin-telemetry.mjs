import client from 'prom-client'
import { bootstrapAPI } from '../bootstrap.mjs';
import { ArchMetricsRepository } from '../repositories/index.mjs';

const PLUGIN_USERS = {}

export const C4StartCounter = new client.Counter({
    name: 'vscode_c4_plugin_start',
    help: 'Количество запусков плагина',
    labelNames: ['version', 'action', 'user']
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

export function registerC4PluginStart(version, action = 'start', user) {
    ArchMetricsRepository.onPluginAction(version, action, user); // Асинхронно обновляем базу данных метрик
    C4StartCounter.inc({ version: version, action: action, user: user });
    processPluginUser(user);
}


bootstrapAPI.addTask(() => {
    ArchMetricsRepository.initPluginActionCounter((version, action, user, value) => {
        C4StartCounter.inc({ version: version, action: action, user: user }, value);
        processPluginUser(user);
    });
})