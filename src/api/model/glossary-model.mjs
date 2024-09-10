import { buildHREF } from "../controllers/controller-decorator.mjs";
import { GLOSSARY_TERM_LIST_RESOURCE_V4 } from "../specifications/glossary-service-spec.mjs";
import { GLOSSARY_LIST_RESOURCE } from "../specifications/paths.mjs";

export class Glossary {
    id;
    type;
    name;
    fullyQualifiedName;
    description;
    deleted;
    self;
    constructor(obj) {
        for (const prop in this) {
            this[prop] = obj[prop] ?? undefined;
        }
        this.self = buildHREF(`${GLOSSARY_LIST_RESOURCE}/${this.id}`);
    }
}

export class Term {
    id;
    name;
    displayName;
    fullyQualifiedName;
    synonyms;
    description;
    self;
    constructor(obj) {
        for (const prop in this) {
            this[prop] = obj[prop] ?? undefined;
        }
        this.self = buildHREF(`${GLOSSARY_TERM_LIST_RESOURCE_V4}/${this.id}`);
    }
}