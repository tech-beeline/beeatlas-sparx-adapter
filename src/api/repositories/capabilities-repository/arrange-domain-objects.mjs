import { NotImplemented } from "../../../utils/errors.mjs"
import { CapabilityBaseDTO } from "./model/capability-dto.mjs";


const DEFAULT_ELEMENT_WIDTH = 150;
const DEFAULT_ELEMENT_HEIGHT = 100;
const LEVEL_OFFSET = 50;
const X_OFFSET = 50;

/**
 * 
 * @param {CapabilityBaseDTO} capability 
 * @param {number} left 
 * @param {number} level 
 */
export const arrangeDomainDiagramObjects = (capability, left = 0, level = 0) => {
    capability.top = - (level * (DEFAULT_ELEMENT_HEIGHT * LEVEL_OFFSET) + LEVEL_OFFSET);
    capability.bottom = capability.top - DEFAULT_ELEMENT_HEIGHT;

    if (!capability.children.length) {
        capability.left = left;
        return capability.right = (left + DEFAULT_ELEMENT_WIDTH);
    }
    const max_right = left;
    for (const child_bc of capability.children) {
        max_right = arrangeDomainDiagramObjects(child_bc, max_right, level + 1) + X_OFFSET;
    }
    capability.left = Math.floor((max_right - X_OFFSET - DEFAULT_ELEMENT_HEIGHT + left) / 2);
    capability.right = capability.left - DEFAULT_ELEMENT_WIDTH;

    return max_right - X_OFFSET;
}

export const updateDomainObjects = async (domain) => {
    NotImplemented();
}

