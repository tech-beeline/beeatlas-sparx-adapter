/**
 * 
 * @param {express.Request} request 
 * @param {*} path 
 * @returns 
 */
export function formatHREF(request, path) {
    return `${path}`;
    //return `${request.protocol}://${request.hostname}:${process.env.API_PORT}${path}`
}

export function NotImplementedRoute(reuqest, response){
    response.status(501).send('Not Implemented');
}