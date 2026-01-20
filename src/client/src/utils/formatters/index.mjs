import { WEB_EA_URL } from "../../resources/paths/index.mjs";

export function formatWebEALink(uid) {
    return `${WEB_EA_URL}/?m=1&o=${uid}`;
}
