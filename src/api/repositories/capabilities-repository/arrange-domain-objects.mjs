import { NotImplemented } from "../../../utils/errors.mjs"
import eaRepository from "../sparx-ea-repository/ea-repository.mjs";
import { t_diagram } from "../sparx-ea-repository/index.mjs";
import { CapabilityBaseDTO, DomainDTO } from "./model/capability-dto.mjs";
import { insertNewOjbects } from "./queries/update-domain-diagram.mjs";
import { domainDiagramName } from "./utils/index.mjs";


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

    capability.top = - (level * (DEFAULT_ELEMENT_HEIGHT + LEVEL_OFFSET) + LEVEL_OFFSET);
    capability.bottom = capability.top - DEFAULT_ELEMENT_HEIGHT;

    if (!capability.children.length) {
        capability.left = left;
        return capability.right = (left + DEFAULT_ELEMENT_WIDTH);
    }
    let max_right = left;
    for (const child_bc of capability.children) {
        max_right = arrangeDomainDiagramObjects(child_bc, max_right, level + 1) + X_OFFSET;
    }
    capability.left = Math.floor((max_right - X_OFFSET - DEFAULT_ELEMENT_HEIGHT + left) / 2);
    capability.right = capability.left - DEFAULT_ELEMENT_WIDTH;

    return max_right - X_OFFSET;
}

/**
 * 
 * @param {DomainDTO} domain 
 */
export const updateDomainDiagram = async (domain) => {
    if (!domain.autoDiagramId) {
        const diagram_name = domainDiagramName(domain);
        console.log(`Диаграма ${diagram_name} не найдена, создаем ее`);
        const data = new t_diagram({
            name: diagram_name,
            package_id: domain.package_id,
            diagram_type: "Component"
        });
        /**@type {t_diagram} */
        const diagram = await eaRepository.insert(t_diagram, data);
        domain.autoDiagramId = diagram.diagram_id;
        console.log(`Диаграмма ${diagram_name} создана`);
    }

    NotImplemented();
}

