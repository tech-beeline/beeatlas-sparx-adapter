//import { Tree, TreeNode, Typography } from "@beeline/design-system-react";
import { Typography } from "@beeline/design-system-react";
import { ExpandMore, KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import { Accordion, AccordionDetails, AccordionSummary, Box } from "@mui/material";
import { TreeItem, TreeView } from "@mui/x-tree-view";

export function PreviewAccordion({ preview }) {
    return preview && <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>Предварительный просмотр информации, которая должна загрузиться в Витрину ФДМ</AccordionSummary>
        <AccordionDetails>{!preview.fail && preview.containers?.length ?
            <Box>
                <Typography>Система:</Typography>
                Название : {preview.name}, CMDB : {preview.cmdb}
                <TreeView
                    defaultCollapseIcon={<KeyboardArrowUp />}
                    defaultExpandIcon={<KeyboardArrowDown />}
                    defaultExpanded={preview.containers?.map((_, i) => `${i}`)}
                >
                    Контейнеры
                    {preview.containers?.map((c, i) => <TreeItem
                        label={<Typography color="blue">Container [{c.code}] {c.name}</Typography>} key={i} nodeId={`${i}`}>
                        {c.interfaces?.length ? c.interfaces?.map((api, j) =>
                            <TreeItem label={`[${api.code}] ${api.name}`} key={j} nodeId={`${i}-${j}`} >
                            </TreeItem>
                        ) : null
                        }
                    </TreeItem>)}
                </TreeView>
            </Box> : <Box>Ничего не выгрузится {preview.fail&&preview.fail}</Box>}
        </AccordionDetails>
    </Accordion>
}