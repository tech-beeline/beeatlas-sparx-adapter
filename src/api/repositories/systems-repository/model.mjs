export class SystemDTO {
    code;
    name;
    description;
    version;
    author;
    status;
    FQName;
    modifiedDate;
    constructor(src) {
        if (!src) return;
        const { code, name, description, version, status, author, FQName, modifiedDate } = src;
        this.code = code;
        this.name = name;
        this.description = description;
        this.author = author;
        this.FQName = FQName;
        this.version = version;
        this.status = status;
        this.modifiedDate = modifiedDate;
    }
}