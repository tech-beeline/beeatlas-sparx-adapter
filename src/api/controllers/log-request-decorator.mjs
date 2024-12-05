import express from 'express'

/**
 * @param {*} fn 
 */
export function logRequestDecorator(fn) {
    /**
    * @param {express.Request} request 
    * @param {express.Response} response 
    * @param {*} next 
     */
    return async (request, response, next) => {
        console.info(`${request.method} ${request.path}`);
        console.log('body', request.body);
        await fn(request, response, next);
        console.log('resultStatus', response.status);
    };
}