import { AccountTree, Check, ExpandMore, KeyboardArrowDown, KeyboardArrowUp, Warning, WarningAmber } from '@mui/icons-material';
import { Accordion, AccordionDetails, AccordionSummary, Box, Collapse, IconButton, List, ListItem, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { withStyles } from '@mui/styles'
import { TreeItem, TreeView } from '@mui/x-tree-view';
import React, { useState } from 'react';

function Errors({ errors }) {
    return (
        errors ? <>{errors.map(e => <TreeItem sx={{color:"red"}} label={e}></TreeItem>)}</> : null
    )
}

function CallItem({ call }) {
    const LabelIcon = call.errors ? <Warning /> : call.invalidChildren ? <WarningAmber sx={{ color: "red" }} /> : <Check />
    const CallTreeItem = call.errors ? withStyles({
        label: {
            color: "red"
        }
    })(TreeItem) : call.invalidChildren ?
        TreeItem : withStyles({
            label: {
                color: "green"
            }
        })(TreeItem);

    return call.errors ? <CallTreeItem label={<div>{LabelIcon}{`${call.client_code ?? call.client_name}->${call.server_code ?? call.server_name} ${call.name}`}</div>} nodeId={call.ea_guid}>
        <Errors errors={call.errors}/>
        {call.children?.map((c, i) => <CallItem key={i} call={c} />)}
    </CallTreeItem> : <CallTreeItem label={<div>{LabelIcon}{`${call.client_code ?? call.client_name}->${call.server_code ?? call.server_name} ${call.name}`}</div>} nodeId={call.ea_guid}>
        {call.children?.map((c, i) => <CallItem key={i} call={c} />)}
    </CallTreeItem>
}

export function CallTraceSection({ callTree }) {
    return <Accordion component={Paper}>
        <AccordionSummary component={Paper} expandIcon={<ExpandMore />}><AccountTree/><Box fontWeight='fontWeightMedium' display='inline'>Иерархия вызовов</Box></AccordionSummary>
        <AccordionDetails>
            <Typography variant='h8' component={Paper}>Легенда: <Warning sx={{color:"red"}}/> - ошибка заполнения взаимодействия, <WarningAmber sx={{ color: "red"}}/> - Ошибка заполнения в дочерних вызовах, <Check sx={{ color : "green"}}/> - корректное заполнение</Typography>
            <Box component={Paper}>
                <TreeView defaultCollapseIcon={< KeyboardArrowUp />} defaultExpandIcon={<KeyboardArrowDown />}>
                    {callTree.map((it, i) => <CallItem key={i} call={it} />)}
                </TreeView>
            </Box>
        </AccordionDetails>
    </Accordion>
}