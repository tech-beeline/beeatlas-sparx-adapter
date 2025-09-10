import {
    AccountTree,
    ExpandMore,
    Launch
} from "@mui/icons-material";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Link,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from "@mui/material";

import { useEffect, useState } from "react";
import { ApiIcon, ContainerIcon } from "../icons/index.mjs";
import {
    Tab,
    Tabs
} from "@beeline/design-system-react";
import { ProvidedApiBox } from "./provider-api.mjs";


export function CapabilityBox({ capabilityCode }) {
    const [capability, setCapability] = useState(null);


    useEffect(() => {
        async function loadCapability() {
            try {
                if (!capabilityCode)
                    return;
                const req = await fetch(`/api/v4/tc/${encodeURIComponent(capabilityCode)}`);
                if (req.status !== 200) {
                    throw Error(await req.text());
                }
                setCapability(await req.json());

            } catch (error) {
                console.log(error);
            }
        }

        loadCapability();
    }, [capabilityCode]);

    return (
        <Link href={`https://beeatlas.vimpelcom.ru/models/search?request=${encodeURIComponent(capabilityCode)}`} target="_blank">{capability ? capability.name : capabilityCode}
        </Link>)
}

function MethodsTable({ methods }) {
    if (!methods || !methods.length) {
        return null;
    }
    return <TableContainer component={Paper}>
        <Table size="small" padding="none">
            <colgroup>
                <col width="20%" />
                <col width="20%" />
            </colgroup>
            <TableHead>
                <TableRow key="head">
                    <TableCell >Метод</TableCell><TableCell>Техническая возможность</TableCell><TableCell>RPS</TableCell><TableCell>Latency</TableCell><TableCell>Error Rate</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {methods.map((m, i) => (
                    <TableRow hover key={i}>
                        <TableCell>{m.name}</TableCell><TableCell>{m.implements && <CapabilityBox capabilityCode={m.implements} />}</TableCell><TableCell>{m.rps}</TableCell><TableCell>{m.latency}</TableCell><TableCell>{m.error_rate}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </TableContainer>
}


function ApiAccorion({ api }) {
    return (
        <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}><ApiIcon />
                <Box fontWeight='fontWeightMedium' display='inline'>[{api.code}] {api.name}</Box><CapabilityBox capabilityCode={api.capabilityCode} />
            </AccordionSummary>
            <AccordionDetails>
                <Box component={Paper}>
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
                                    <TableCell>{api.code}</TableCell>
                                    <TableCell>{api.protocol}</TableCell>
                                    <TableCell>{api.version}</TableCell>
                                    <TableCell>{api.specification ? <a href={api.specification} target="_blank" rel="noreferrer">{api.specification}</a> : null}</TableCell>
                                    <TableCell><CapabilityBox capabilityCode={api.implements} /></TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <MethodsTable methods={api.methods ?? []} />
                </Box>
            </AccordionDetails>
        </Accordion>
    )
}
function ContainerAccordion({ container }) {
    return (
        <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}><ContainerIcon />
                <Box fontWeight='fontWeightMedium' display='inline'>[{container.code}] {container.name}
                </Box>
            </AccordionSummary>
            <AccordionDetails>
                <Box component={Paper}>
                    {(container.interfaces ?? []).map((api, i) => <ApiAccorion key={i} api={api} />)}
                </Box>
            </AccordionDetails>
        </Accordion>
    )
}


export function SystemContainers({ system }) {
    return (
        <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}><AccountTree />
                <Box fontWeight='fontWeightMedium' display='inline'>Контейнеры, интерфейсы и SLA</Box> <Box>&nbsp;<Link href={`${system.code.toLowerCase()}/api`} target="_blank" ><Launch />API</Link></Box>
            </AccordionSummary>
            <AccordionDetails>
                <Tabs bodyClassName="classForAllTabs">
                    <Tab label="Контейнеры в structurizr" key={1}>
                        <Box component={Paper}>
                            {(system.containers ?? []).map((container, i) => <ContainerAccordion key={i} container={container} />)}
                        </Box>
                    </Tab>

                    <Tab label="Добавленные вручную" key={3}><ProvidedApiBox app={system} /></Tab>
                </Tabs>
            </AccordionDetails>
        </Accordion>
    )
}