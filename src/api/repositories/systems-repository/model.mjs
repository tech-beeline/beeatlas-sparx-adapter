import { CONTAINERS_SUBPACKAGE_NAME } from "./const.mjs";

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

export class SystemDTOInternal extends SystemDTO {
    /**
     *
     */
    constructor(src) {
        super(src);
        Object.defineProperty(this, "package_id", {
            get: function () {
                return src.package_id;
            }
        });
        const containerPackageId = src.subpackages?.find(c => c.name === CONTAINERS_SUBPACKAGE_NAME)?.package_id;

        Object.defineProperty(this, "containerPackageId", {
            get: function () {
                return containerPackageId;
            }
        });
        Object.defineProperty(this, "object_id", {
            get: function () {
                return src.object_id;
            }
        });
    }
    get package_id() { }
    get object_id() { }
    get containerPackageId() { }
}