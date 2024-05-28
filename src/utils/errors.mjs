export function BadRequest(message) {
    return Object.assign(Error(message), { status: 400 });
}

export function NotFound(message) {
    return Object.assign(Error(message), { status: 404 });
}

export function ConflictException(message) {
    return Object.assign(Error(message), { status: 409 });
}


export function ProcessError(error, response) {
    console.error(error);
    if (!error) return response.status(500);

    if (error.status) {
        return response.status(error.status).json({ message: error.message });
    }
    return response.status(500).json({ message: error.message })
}

export function NotImplemented(str) {
    throw Error(str ? `Not implemented : ${str}` : 'Not implemented');
}