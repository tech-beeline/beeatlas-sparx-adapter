import { ApiOutlined, Code, ExpandMore, KeyboardArrowDown, KeyboardArrowUp, SettingsApplications, SettingsApplicationsOutlined } from '@mui/icons-material';
import { Accordion, AccordionDetails, AccordionSummary, Box, Paper } from '@mui/material';
import React, { useState } from 'react';
import { TreeItem, TreeView } from '@mui/x-tree-view';

const SKIP_OBJECT_TYPE = {
    'Sequence': true,
    "MessageEndpoint": true
}

const PROTOCOL_COLOR_MAP = {
    DB: "blue",
    REST: "green"
}

function InterfaceTreeItem({ nodeId, api }) {
    const apiColor = PROTOCOL_COLOR_MAP[api.protocol] ?? "red";
    return (
        <TreeItem  label={<div style={{ color: apiColor }}><ApiOutlined /> {api.name} [protocol:{api.protocol ?? "Не указан"}]</div>} nodeId={nodeId}>
            {Object.values(api.methods ?? []).map((m, j) =>
                <TreeItem label={<div><Code />{m.name}</div>} nodeId={`${nodeId}-${m.name} `} key={`${j}`} />)}
        </TreeItem>
    )
}


export function ApplicationSection({ applications }) {
    const products = Object.values(applications).filter(a => isNaN(a.code));
    const objects = Object.values(applications).filter(a => !isNaN(a.code));
    return <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}><SettingsApplications /><Box fontWeight='fontWeightMedium' display='inline'>Приложения и методы, используемые в сценарии</Box></AccordionSummary>
        <AccordionDetails>
            <TreeView component={Paper} defaultCollapseIcon={< KeyboardArrowUp />} defaultExpandIcon={<KeyboardArrowDown />}>
                <TreeItem label="Приложения" nodeId='products'>
                    {products.map(app => <TreeItem sx={{ fontWeight: "bolder" }} label={<div><SettingsApplicationsOutlined />{`[${app.code}] ${app.name} `}</div>} nodeId={app.code ?? "NULL"} key={app.code}>
                        {Object.values(app.interfaces).map((it, i) => <InterfaceTreeItem  nodeId={`${app.code} -${i} `} api={it} />)}
                    </TreeItem>)}
                </TreeItem>
                <TreeItem label="Другие участники" nodeId='objects'>
                    {objects.filter(a => !SKIP_OBJECT_TYPE[a.type]).map(app =>
                        <TreeItem sx={{ fontWeight: "bolder" }} label={<div><SettingsApplicationsOutlined />{`[${app.code}] ${app.name} `}</div>} nodeId={"id" + app.code ?? "NULL"} key={app.code}>
                            {Object.values(app.interfaces).map((it, i) =>
                                <TreeItem label={<div><ApiOutlined /> {it.name}</div>} key={`- ${i} `} nodeId={`#${app.code} -${i} `}>
                                    {Object.values(it.methods).map((m, j) =>
                                        <TreeItem label={<div><Code />{m.name}</div>} nodeId={`${app.code} -${i} -${m.name} `} key={`${app.code} -${i} -${m.name} `} />)}
                                </TreeItem>)}
                        </TreeItem>)}
                </TreeItem>
            </TreeView>
        </AccordionDetails>
    </Accordion>
}