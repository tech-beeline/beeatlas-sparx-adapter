export function BadRequest(message) {
    return Object.assign(Error(message), { status: 400 });
}

export function NotFound(message) {
    return Object.assign(Error(message), { status: 404 });
}


export function ProcessError( error, response ){

}