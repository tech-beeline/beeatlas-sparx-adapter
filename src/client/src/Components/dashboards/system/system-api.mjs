import { AccountTree, Api, Code, ExpandMore, KeyboardArrowDown, KeyboardArrowUp, RectangleOutlined, SettingsApplications } from "@mui/icons-material";
import { Accordion, AccordionDetails, AccordionSummary, Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { TreeItem, TreeView } from "@mui/x-tree-view";
import { useEffect, useState } from "react";


function CapabilityBox({ capabilityCode }) {
    const [error, setError] = useState(null);
    const [capability, setCapability] = useState(null);

    async function loadCapability() {
        if (!capabilityCode)
            return;
        const req = await fetch(`/api/tech-capabilities/${encodeURIComponent(capabilityCode)}`);
        if (req.status != 200) {
            setError(await req.text());
            return;
        }
        setCapability(await req.json());
    }
    useEffect(() => {
        loadCapability();
    }, [])
    return (
        <Box> {capability ? capability.name : capabilityCode}
        </Box>)
}

function MethodsTreeItem({ it }) {
    return ( it.methods && it.methods.length?
        <TreeItem label={<div><Code /> Методы</div>} nodeId={`container-${it.code}-methods`} key={`container-${it.code}-methods`}>
           <TableContainer component={Paper}>
            <Table size="small" padding="none">
                <TableHead>
                    <TableRow>
                        <TableCell >Метод</TableCell><TableCell>RPS</TableCell><TableCell>Latency</TableCell><TableCell>Error Rate</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {it.methods.map( (m,i)=>(
                        <TableRow hover="true">
                            <TableCell>{m.name}</TableCell><TableCell>{m.rps}</TableCell><TableCell>{m.latency}</TableCell><TableCell>{m.error_rate}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
           </TableContainer>
        </TreeItem>:null
    )
}

function InterfaceTreeItem({ it }) {
    console.log(it)
    return (
        <TreeItem nodeId={`container-${it.code}`} key={`container-${it.code}`} label={<Box><Api />[{it.code}] {it.name}</Box>}>
            <TableContainer component={Paper} key='summary'>
                <Table size="small" padding="none">
                    <TableHead>
                        <TableRow key='0'>
                            <TableCell>Код</TableCell>
                            <TableCell>Протокол</TableCell>
                            <TableCell>Версия</TableCell>
                            <TableCell>Спецификация API</TableCell>
                            <TableCell>Техническая возможность</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow key='1'>
                            <TableCell>{it.code}</TableCell>
                            <TableCell>{it.protocol}</TableCell>
                            <TableCell>{it.version}</TableCell>
                            <TableCell>{it.api_url ? <a href={it.api_url} target="_blank">{it.api_url}</a> : null}</TableCell>
                            <TableCell><CapabilityBox capabilityCode={it.capabilityCode} /></TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
            <MethodsTreeItem it={it} />
        </TreeItem>
    )
}

export function ApplicationApi({ system }) {
    return (
        <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}><AccountTree />
                <Box fontWeight='fontWeightMedium' display='inline'>Структура API</Box>
            </AccordionSummary>
            <AccordionDetails>
                <Box component={Paper}>
                    <TreeView defaultCollapseIcon={< KeyboardArrowUp />} defaultExpandIcon={<KeyboardArrowDown />}>
                        {system.containers.map((c, i) =>
                            <TreeItem nodeId={`container-${i}`} label={<Box><RectangleOutlined /><Typography variant="h8">{`${c.name} [${c.code}]`}</Typography></Box>} key={`container-${i}`}>
                                {c.interfaces?.map((it, j) => <InterfaceTreeItem it={it} key={j} />)}
                            </TreeItem>)}
                    </TreeView>
                </Box>
            </AccordionDetails>
        </Accordion>
    )
}