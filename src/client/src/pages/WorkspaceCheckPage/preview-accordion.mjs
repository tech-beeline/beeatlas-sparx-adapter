import { Tree, TreeNode, Typography } from "@beeline/design-system-react";
import { ExpandMore } from "@mui/icons-material";
import { Accordion, AccordionDetails, AccordionSummary, Box } from "@mui/material";

export function PreviewAccordion({ preview }) {
    return <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>Предварительный просмотр информации, которая должна загрузиться в Витрину ФДМ</AccordionSummary>
        <AccordionDetails>
            <Box>
                <Typography>Система:</Typography>
                Название : {preview.name}, CMDB : {preview.cmdb}
                <Tree title="Контейнеры">
                    {preview.containers?.map((c, i) => <TreeNode title={`Container [${c.code}] ${c.name}`} key={i} id={i}>
                        {c.interfaces?.length ? c.interfaces?.map((api, j) =>
                            <TreeNode title={`[${api.code}] ${api.name}`} key={j} id={`${i}-${j}`} >
                            </TreeNode>
                        ):null
                        }
                    </TreeNode>)}
                </Tree>
            </Box>
        </AccordionDetails>
    </Accordion>
}