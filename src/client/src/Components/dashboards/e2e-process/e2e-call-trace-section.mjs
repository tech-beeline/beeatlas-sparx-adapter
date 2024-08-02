import { ExpandMore, KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { Accordion, AccordionDetails, AccordionSummary, Box, Collapse, IconButton, List, ListItem, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { TreeItem, TreeView } from '@mui/x-tree-view';
import React, { useState } from 'react';

function CallItem({ call }) {
    return <TreeItem label={`${call.client_code??call.client_name}->${call.server_code??call.server_name} ${call.name}`} nodeId={call.ea_guid}>
        {call.children?.map( (c,i)=><CallItem key={i} call={c}/>)}
    </TreeItem>
}

export function CallTraceSection({ callTree }) {
    console.log(callTree);
    return <Accordion component={Paper}>
        <AccordionSummary expandIcon={<ExpandMore />}><Box fontWeight='fontWeightMedium' display='inline'>Иерархия вызовов</Box></AccordionSummary>
        <AccordionDetails>
            <Box component={Paper}>
                <TreeView defaultCollapseIcon={< KeyboardArrowUp />} defaultExpandIcon={<KeyboardArrowDown />}>
                    {callTree.map((it, i) => <CallItem key={i} call={it} />)}
                </TreeView>
            </Box>
        </AccordionDetails>
    </Accordion>
}