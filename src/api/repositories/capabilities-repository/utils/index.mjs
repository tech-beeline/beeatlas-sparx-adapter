import { CapabilityDTO } from "../model.mjs";

/**
 * 
 * @param {CapabilityDTO} a 
 * @param {CapabilityDTO} b 
 * @returns 
 */
export const capabilityAttributesEquals = (a, b) => a.name === b.name &&
    a.author === b.author &&
    a.status === b.status &&
    a.description == b.description;