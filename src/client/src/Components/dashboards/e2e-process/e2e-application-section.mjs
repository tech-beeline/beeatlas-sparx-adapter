import { ApiOutlined, Code, ExpandMore, KeyboardArrowDown, KeyboardArrowUp, SettingsApplications, SettingsApplicationsOutlined } from '@mui/icons-material';
import { Accordion, AccordionDetails, AccordionSummary, Box, Collapse, IconButton, List, ListItem, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import React, { useState } from 'react';
import { TreeItem, TreeView } from '@mui/x-tree-view';

const SKIP_OBJECT_TYPE = {
    'Sequence': true,
    "MessageEndpoint": true
}
export function ApplicationSection({ applications }) {
    const products = Object.values(applications).filter(a => isNaN(a.code));
    const objects = Object.values(applications).filter(a => !isNaN(a.code));
    return <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}><SettingsApplications /><Box fontWeight='fontWeightMedium' display='inline'>Приложения и методы, используемые в сценарии</Box></AccordionSummary>
        <AccordionDetails>
            <TreeView component={Paper} defaultCollapseIcon={< KeyboardArrowUp />} defaultExpandIcon={<KeyboardArrowDown />}>
                <TreeItem label="Приложения" nodeId='products'>
                    {products.map(app => <TreeItem sx={{ fontWeight: "bolder" }} label={<div><SettingsApplicationsOutlined />{`[${app.code}] ${app.name}`}</div>} nodeId={app.code ?? "NULL"} key={app.code}>
                        {Object.values(app.interfaces).map((it, i) => <TreeItem label={<div><ApiOutlined /> {it.name}</div>} key={i} nodeId={`${app.code}-${i}`}>
                            {Object.values(it.methods).map((m, j) => <TreeItem label={<div><Code />{m.name}</div>} nodeId={`${app.code}-${i}-${m.name}`} key={`${app.code}-${i}-${m.name}`} />)}
                        </TreeItem>)}
                    </TreeItem>)}
                </TreeItem>
                <TreeItem label="Другие участники" nodeId='objects'>
                    {objects.filter(a => !SKIP_OBJECT_TYPE[a.type]).map(app => <TreeItem sx={{ fontWeight: "bolder" }} label={<div><SettingsApplicationsOutlined />{`[${app.code}] ${app.name}`}</div>} nodeId={app.code ?? "NULL"} key={app.code}>
                        {Object.values(app.interfaces).map((it, i) => <TreeItem label={<div><ApiOutlined /> {it.name}</div>} key={i} nodeId={`${app.code}-${i}`}>
                            {Object.values(it.methods).map((m, j) => <TreeItem label={<div><Code />{m.name}</div>} nodeId={`${app.code}-${i}-${m.name}`} key={`${app.code}-${i}-${m.name}`} />)}
                        </TreeItem>)}
                    </TreeItem>)}
                </TreeItem>
            </TreeView>
        </AccordionDetails>
    </Accordion>
}