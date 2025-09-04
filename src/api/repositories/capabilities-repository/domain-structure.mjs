import { NotImplemented } from "../../../utils/errors.mjs";
import eaRepository from "../sparx-ea-repository/ea-repository.mjs";
import { t_diagram, t_diagramlinks, t_diagramobjects } from "../sparx-ea-repository/index.mjs";
import { INSERT_DOMAIN_DIAGRAM, SELECT_BC_DOMAIN, SELECT_DOMAIN_DIAGRAM_BY_PACKAGE_ID } from "./capability-queries.mjs";


const DEFAULT_ELEMENT_WIDTH = 150;
const DEFAULT_ELEMENT_HEIGHT = 100;
const LEVEL_OFFSET = 50;
const X__OFFSET = 50;

function layout(capability, left = 0, level = 0) {
    capability.top = -(level * (DEFAULT_ELEMENT_HEIGHT + LEVEL_OFFSET) + LEVEL_OFFSET);
    capability.bottom = capability.top - DEFAULT_ELEMENT_HEIGHT;

    if (!capability.children) {
        capability.left = capability.childrenLeft = left;
        capability.right = capability.childrenRight = (left + DEFAULT_ELEMENT_WIDTH);

        return capability.childrenRight;
    }
    const children = Object.values(capability.children);

    let l = left;
    for (const child of children) {
        const r = layout(child, l, level + 1);
        l = r + X__OFFSET;
    }
    capability.left = Math.floor((l - X__OFFSET - DEFAULT_ELEMENT_WIDTH + left) / 2);
    capability.right = capability.left + DEFAULT_ELEMENT_WIDTH;
    return l - X__OFFSET;
}

export class DomainStructure {
    #members = {};
    domain;
    /** @type {t_diagram} */
    diagram;
    addMember(capbility) {
        const code = capbility.code.toLowerCase();
        if (capbility.isDomain) {
            this.domain = capbility;
        }
        this.#members[code] = capbility;
        const parent = this.#members[capbility.parent.toLowerCase()];
        if (parent) {
            (parent.children = (parent.children ?? {}))[code] = capbility;
        }
    }
    member(code) {
        return this.#members[code.toLowerCase()];
    }
    async updateDiagramObjects() {
        const diagramobjects = await eaRepository.query(`SELECT * FROM t_diagramobjects WHERE diagram_id=$1`, this.diagram.diagram_id);

        const members = Object.values(this.#members);

        for (const member of members) {
            if (!member.object_id) throw Error('member.object_id is not specified');

            const obj = diagramobjects.find(o => o.object_id == member.object_id);
            
            if (!obj) {
                await eaRepository.insert(t_diagramobjects,
                    {
                        diagram_id: this.diagram.diagram_id,
                        object_id: member.object_id,
                        rectleft: member.left,
                        rectright: member.right,
                        recttop: member.top,
                        rectbottom: member.bottom,
                        sequence: 0
                    });
                continue;
            }

            if (obj.rectbottom == -member.bottom
                && obj.rectleft == member.left
                && obj.rectright == member.right
                && obj.recttop == member.top) {
                continue;
            }
            await eaRepository.update(t_diagramobjects, {
                rectleft: member.left,
                rectright: member.right,
                recttop: member.top,
                rectbottom: member.bottom,
                sequence: 0
            }, {
                diagram_id: this.diagram.diagram_id,
                object_id: obj.object_id
            });
        }
        for (const obj of diagramobjects) {
            if (members.find(m => m.object_id == obj.object_id))
                continue;
            await eaRepository.delete(t_diagramobjects, { diagram_id: this.diagram.diagram_id, object_id: obj.object_id });
        }
    }

    async updateLinks() {
        const links = await eaRepository.query(`SELECT * FROM t_diagramlinks WHERE diagramid=$1`, this.diagram.diagram_id);
        const members = Object.values(this.#members);

        for (const member of members) {
            const l = links.find(l => l.connectorid == member.connector_id);
            if (!l) {
                await eaRepository.insert(t_diagramlinks, {
                    diagramid: this.diagram.diagram_id,
                    connectorid: member.connector_id,
                    hidden: 0
                });
            }
        }
        for (const l of links) {
            if (!members.find(m => m.connector_id == l.connectorid)) {
                await eaRepository.delete(t_diagramlinks, { diagramid: this.diagram.diagram_id, connectorid: l.connectorid });
            }
        }
    }
    async arrange() {
        if (!this.diagram.diagram_id) throw Error('diagram_id not specified');

        layout(this.domain);

        await this.updateDiagramObjects();
        return this.updateLinks();
    }
}

/**
 * 
 * @returns {Promise<DomainStructure>}
 */
export const loadDomainStructure = async (code) => {
    const domainRows = await eaRepository.queryRows(SELECT_BC_DOMAIN, [code]);
    if (!domainRows.length) throw Error(`Не удалось получить структуру домена для BC code="${code}"`);

    const domainStructure = new DomainStructure();
    domainRows.forEach(row => {
        domainStructure.addMember(row);
    });

    domainStructure.diagram = (await eaRepository.queryOne(SELECT_DOMAIN_DIAGRAM_BY_PACKAGE_ID, [domainStructure.domain.package_id])) ??
        (await eaRepository.queryOne(INSERT_DOMAIN_DIAGRAM, [domainStructure.domain.package_id]));

    return domainStructure;
}
