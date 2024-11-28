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
        console.log(`${request.method} ${request.path}`);
        console.log(request.body);
        await fn(request, response, next);
        console.log(`response body:`)
        console.log(response)
    };
}