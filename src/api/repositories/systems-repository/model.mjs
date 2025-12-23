import { CONTAINERS_SUBPACKAGE_NAME } from "./const.mjs";
import { InterfaceEntity } from "./queries/select-interfaces.mjs";

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
    #package_id;
    #object_id;
    #api_pkg_id;
    #tc_pkg_id;
    #c_pkg_id;
    /**
     *
     */
    constructor(src) {
        super(src);
        this.#object_id = src.object_id;
        this.#package_id = src.sys_package_id;
        this.#c_pkg_id= src.c_pkg_id;
        this.#tc_pkg_id = src.tc_pkg_id;
        this.#api_pkg_id = src.api_pkg_id;
    }
    get package_id() {
        return this.#package_id
    }
    set package_id(v) {
        return this.#package_id = v;
    }
    get object_id() { return this.#object_id }
    set object_id(v) {
        return this.#object_id = v;
    }
    get containerPackageId() { return this.#c_pkg_id }
    set containerPackageId(v) {
        return this.#c_pkg_id = v;
    }
    get api_pkg_id() { return this.#api_pkg_id }
    set api_pkg_id(v) {
        return this.#api_pkg_id = v;
    }
    get tc_pkg_id() { return this.#tc_pkg_id }
    set tc_pkg_id(v) {
        return this.#tc_pkg_id = v;
    }
    /**
     * @returns {InterfaceEntity}
     */
    container(code) {
        code = code.toLowerCase();
        return this.containers[code];
    }
}