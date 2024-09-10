import express from 'express'
import { AsyncLocalStorage } from 'async_hooks'
import { NotImplemented } from '../../utils/errors.mjs';

const requestLocalStorage = new AsyncLocalStorage();

/**
 * 
 * @returns {express.Request}
 */
export function getRequestContext() {
    return requestLocalStorage.getStore();
}

export function buildHREF(url) {
    const request = getRequestContext();
    if (!request) return url;

    return `${request.protocol}://${request.header("host")}${url}`
}
/*
* 
* @param {*} controller 
* @returns 
*/
export function createControllerDecorator(controller) {
    controller = controller ?? (() => NotImplemented());
    return async (request, response, next) => {
        try {
            requestLocalStorage.enterWith(request);
            await controller(request, response, next)
        } catch (error) {
            console.error(error)
            return response.status(error.status ?? 500).json({ message: error.message })
        }
    }
}