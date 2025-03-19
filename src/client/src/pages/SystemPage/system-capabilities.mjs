import {
    Alarm,
    CorporateFare,
    Domain,
    ExpandMore,
    KeyboardArrowDown,
    KeyboardArrowUp,
    SmartButton
} from "@mui/icons-material";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Paper
} from "@mui/material";
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
            {capability.children?.sort((a, b) => a.code < b.code ? -1 : a.code > b.code ? 1 : 0).map((c, index) => <CapabilityItem capability={c} key={index} />)}
        </TreeItem>)
}

export function SystemCapabilitiesAccordion({ system }) {

    const [capabilityTree, setCapabilityTree] = useState(null);
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false);

    const loadingDetails = loading ? <AccordionDetails>Loading ...</AccordionDetails> : null;
    const purposeDetails = (
        capabilityTree && !loading ?
            capabilityTree.children && capabilityTree.children.length ?
                <AccordionDetails>
                    <TreeView component={Paper} defaultCollapseIcon={< KeyboardArrowUp />} defaultExpandIcon={<KeyboardArrowDown />}>
                        {capabilityTree.children?.sort((a, b) => a.code < b.code ? -1 : a.code > b.code ? 1 : 0).map((c, i) => <CapabilityItem key={i} capability={c} />)}
                    </TreeView>
                </AccordionDetails> :
                <AccordionDetails>
                    Возможностей, связанных с системой не найдено
                </AccordionDetails> : null
    )

    useEffect(() => {
        const loadCapability = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/v4/systems/${system.code}/purpose`);
                if (response.status !== 200) {
                    throw Error(await response.text())
                }
                setCapabilityTree(await response.json());
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        }

        loadCapability()
    }, [system])

    return (
        <Accordion>
            <AccordionSummary component={Paper} expandIcon={<ExpandMore />}><CorporateFare />
                <Box fontWeight='fontWeightMedium' display='inline'>Позиционирование продукта в ФДМ</Box>
            </AccordionSummary>
            {loadingDetails}
            {error ?
                <AccordionDetails color="red">
                    <Alarm />{error}
                </AccordionDetails> :
                purposeDetails
            }
        </Accordion>
    )
}