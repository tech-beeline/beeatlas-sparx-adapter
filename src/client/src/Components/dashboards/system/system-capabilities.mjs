import { Alarm, CorporateFare, Domain, ExpandMore, KeyboardArrowDown, KeyboardArrowUp, LocalActivity, SettingsApplications, SmartButton } from "@mui/icons-material";
import { Accordion, AccordionDetails, AccordionSummary, Box, Paper } from "@mui/material";
import { TreeItem, TreeView } from "@mui/x-tree-view";
import { useEffect, useState } from "react";


/**
 * 
 * @param {capability} props 
 */
function CapabilityItem({ capability }) {

    const icon = capability.type === 'Domain' ? <Domain />
        : capability.type === "Capability" ? <CorporateFare /> : <SmartButton />;
    return (
        <TreeItem nodeId={capability.code} label={<>{icon}{`${capability.code} ${capability.name}`}</>}>
            {capability.children?.map((c, index) => <CapabilityItem capability={c} key={index} />)}
        </TreeItem>)
}

export function SystemCapabilitiesAccordion({ system }) {
    const [capabilityTree, setCapabilityTree] = useState(null);
    const [error, setError] = useState(null)
    const loadCapability = async () => {
        try {
            const response = await fetch(`/api/v4/systems/${system.code}/purpose`);
            if (response.status != 200) {
                throw Error(response.body)
            }
            setCapabilityTree(await response.json());
        } catch (error) {
            setError(error.message);
        }
    }

    useEffect(() => { loadCapability() }, [])
    return (
        <Accordion>
            <AccordionSummary component={Paper} expandIcon={<ExpandMore />}><CorporateFare />
                <Box fontWeight='fontWeightMedium' display='inline'>Позиционирование продукта в ФДМ</Box>
            </AccordionSummary>
            {error ?
                <AccordionDetails color="red">
                    <Alarm />{error}
                </AccordionDetails> :
                capabilityTree ?
                    <AccordionDetails>
                        <TreeView component={Paper} defaultCollapseIcon={< KeyboardArrowUp />} defaultExpandIcon={<KeyboardArrowDown />}>
                            {capabilityTree.children?.map((c, i) => <CapabilityItem key={i} capability={c} />)}
                        </TreeView>
                    </AccordionDetails> :
                    <AccordionDetails>
                        <LocalActivity />Идет загрузка
                    </AccordionDetails>
            }
        </Accordion>
    )
}