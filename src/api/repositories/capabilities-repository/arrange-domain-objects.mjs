import { NotImplemented } from "../../../utils/errors.mjs"
import eaRepository from "../sparx-ea-repository/ea-repository.mjs";
import { t_diagram, t_diagramobjects } from "../sparx-ea-repository/index.mjs";
import { CapabilityBaseDTO, DomainDTO } from "./model/capability-dto.mjs";
import { insertNewOjbects, selectLinks, selectObjects } from "./queries/update-domain-diagram.mjs";
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
export const calculateObjectPositions = (capability, left = 0, level = 0) => {

    capability.top = - (level * (DEFAULT_ELEMENT_HEIGHT + LEVEL_OFFSET) + LEVEL_OFFSET);
    capability.bottom = capability.top - DEFAULT_ELEMENT_HEIGHT;

    if (!capability.children.length) {
        capability.left = left;
        return capability.right = (left + DEFAULT_ELEMENT_WIDTH);
    }
    let max_right = left;
    for (const child_bc of capability.children) {
        max_right = calculateObjectPositions(child_bc, max_right, level + 1) + X_OFFSET;
    }
    capability.left = Math.floor((max_right - X_OFFSET - DEFAULT_ELEMENT_HEIGHT + left) / 2);
    capability.right = capability.left + DEFAULT_ELEMENT_WIDTH;

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

    const bc_members = [domain, ...domain.members.filter(m => !m.isDomain)];

    const [links, objects] = await Promise.all([
        selectLinks(domain.autoDiagramId), selectObjects(domain.autoDiagramId)
    ]);

    const links_to_delete = links.filter(l => !bc_members.find(o => o.object_id === l.end_object_id || o.object_id == l.start_object_id));
    const objects_to_delete = objects.filter(o => !bc_members.find(b => b.object_id === o.object_id));
    const new_objects = bc_members.filter(b => !objects.find(o => o.object_id == b.object_id)).map(b => new t_diagramobjects({
        object_id: b.object_id,
        recttop: b.top, rectbottom: b.bottom, rectleft: b.left, rectright: b.right
    }));

    const obj_to_update = [];
    for (const o of objects) {
        const b = bc_members.find(b => b.object_id === o.object_id);
        if (!b) continue;
        if (b.top !== o.recttop ||
            b.bottom != o.rectbottom ||
            b.left !== o.rectleft ||
            b.right !== o.rectright) {

            o.recttop = b.top;
            o.rectbottom = b.bottom;
            o.rectleft = b.left;
            o.rectright = b.right;
            obj_to_update.push(o);
        }
    }


    if (links_to_delete.length) {
        console.log(`Удаляется ${links_to_delete.length} t_diagramlinks`);
        await eaRepository.removeDiagramLinks(links_to_delete.map(l => l.instance_id));
    }
    if (objects_to_delete.length) {
        console.log(`Удаляется ${objects_to_delete.length} t_diagramobjects`);
        await eaRepository.removeDiagramObjects(objects_to_delete.map(o => o.object_id));
    }
    if (new_objects.length) {
        console.log(`Добавляется ${new_objects.length} t_diagramobjects`);
        await eaRepository.insertDiagramObjects(domain.autoDiagramId, new_objects);
    }

    if (obj_to_update.length) {
        console.log(`Обновляется ${obj_to_update.length} t_diagramobjects`);
        await eaRepository.updateDiagramObjects(domain.autoDiagramId, obj_to_update);
    }
}



export const arrangeDomain = async (domain) => {
    console.log(`Вычисляем расположение объектов для домена ${domain.code}`);
    calculateObjectPositions(domain);
    console.log(`Обновляем диаграмму "${domainDiagramName(domain)}" для домена ${domain.code}`);
    await updateDomainDiagram(domain);
}