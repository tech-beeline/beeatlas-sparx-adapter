import { NotImplemented } from "../../../utils/errors.mjs";
import {
    CapabilityBaseDTO,
    DomainDTO
} from "./model/capability-dto.mjs";

import {
    selectDomains,
    selectBC,
    selectOwners
} from "./queries/index.mjs";

export async function loadCapabilities() {
    const [domains, capabilities, owners] = await Promise.all([
        selectDomains(), selectBC(), selectOwners()
    ]);

    const owner_map = owners.reduce((r, v) => (r[v.object_id] = v.name, r), {});

    const capability_map = {};
    for (const domain_row of domains.filter(d => d.code !== d.parent_code)) {
        const domain = capability_map[domain_row.code.toLowerCase()] = new DomainDTO(domain_row);
        domain.owner = owner_map[domain.object_id];
    }

    for (const domain_row of domains.filter(d => d.name === 'BC')) {
        /** @type {DomainDTO} */
        const domain = capability_map[domain_row.code.toLowerCase()];
        if (!domain) throw Error(`Не найден домен с кодом ${domain_row.code}`);
        domain.bcPackageId = domain_row.package_id;
    }

    for (const domain_row of domains.filter(d => d.diagram === `[AUTO] ${d.name}`)) {
        /** @type {DomainDTO} */
        const domain = capability_map[domain_row.code.toLowerCase()];
        domain.autoDiagramId = domain_row.diagram_id;
    }

    for (const bc_row of capabilities) {
        const bc = capability_map[bc_row.code.toLowerCase()] = new CapabilityBaseDTO(bc_row);
        bc.owner = owner_map[bc.object_id];
        bc.setDomain(capability_map[bc_row.domain_code.toLowerCase()])
    }

    for (const bc_code in capability_map) {
        /** @type {CapabilityBaseDTO} */
        const bc = capability_map[bc_code];
        /** @type {CapabilityBaseDTO} */
        if (!bc.parent_code) {
            continue;
        }
        const parent = capability_map[bc.parent_code.toLowerCase()];
        if (!parent) throw Error(`При поиска родительской не найдена возможность с кодом ${bc.parent_code}`);
        bc.setParent(parent);
    }
    /** @type {CapabilityBaseDTO} */
    const root = capability_map['grp.000'];
    const cap_list = root.addChildrenRecursive([root]);
    return cap_list;
}