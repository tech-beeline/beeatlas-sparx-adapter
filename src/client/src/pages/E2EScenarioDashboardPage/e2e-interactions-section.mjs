import { ExpandMore, KeyboardArrowDown, KeyboardArrowUp, Link } from '@mui/icons-material';
import { Accordion, AccordionDetails, AccordionSummary, Box, Collapse, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import React, { useState } from 'react';
import { TreeItem, TreeView } from '@mui/x-tree-view';
import MessageEditForm from './message-form.mjs';


function alertText(txt, color = "red") {
    return <b><font color={color}>{txt}</font></b>
}

const NO_DATA_MESSAGE = alertText('Нет')


function MessageContexts({ message }) {
    const stack = message.contexts.map((ctx, ci) => ctx.reduceRight((acc, v, i) => <TreeItem nodeId={`${ci}-${i}`} key={i} label={v}>{acc}</TreeItem>, ""))
    return (
        <Box component={Paper}>
            <TreeView defaultCollapseIcon={< KeyboardArrowUp />} defaultExpandIcon={<KeyboardArrowDown />}>
                {stack}
            </TreeView>
        </Box>
    )
}

function UsedMethods({ message }) {
    const usedMethods = {}
    function build(m) {
        for (const c of m.children ?? []) {
            if (m.operation_guid) {
                const app = usedMethods[m.server_code ?? m.server_name] ?? (usedMethods[m.server_code ?? m.server_name] = { server: m.server_code ?? m.server_name, methods: {} });
                app.methods[m.operation_guid] ?? (app.methods[m.operation_guid] = { operation_guid: m.operation_guid, name: m.name, count: 0 }).count++;
            }
            build(c);
        }
    }
    build(message)
    console.log(Object.values(usedMethods))
    return (
        <TreeView defaultCollapseIcon={< KeyboardArrowUp />} defaultExpandIcon={<KeyboardArrowDown />}>
            {Object.values(usedMethods).map(app => <TreeItem label={app.server} nodeId={app.server}>
                {Object.values(app.methods).map(m => <TreeItem label={m.name} nodeId={m.operation_guid}></TreeItem>)}
            </TreeItem>)}
        </TreeView>
    );
}

function Message(props) {
    const [message, setMessage] = useState(props.message);
    const rps_color = !isNaN(message.rps) ? "green" : "red";
    const latence_color = !isNaN(message.latency) ? "green" : "red";
    const error_color = !isNaN(message.errorRate) ? "green" : "red";


    return <TableRow key={message.ea_guid}>
        <TableCell key={`edit-${message.ea_guid}`}><MessageEditForm message={message} setMessage={setMessage} /></TableCell>
        <TableCell key={`rps-${message.ea_guid}`}>{isNaN(message.rps) ? alertText(NO_DATA_MESSAGE) : alertText(message.rps, rps_color)}</TableCell>
        <TableCell key={`latency-${message.ea_guid}`}>{isNaN(message.latency) ? alertText(NO_DATA_MESSAGE) : alertText(message.latency, latence_color)}</TableCell>
        <TableCell key={`errorRate-${message.ea_guid}`}>{isNaN(message.errorRate) ? alertText(NO_DATA_MESSAGE) : alertText(message.errorRate, error_color)}</TableCell>
        <TableCell key={`diagram-`}><a target="_blank" href={`https://ms-seaapp001.bee.vimpelcom.ru:83/?m=1&o=${message.d_uid}`}>{message.diagram}</a></TableCell>
        <TableCell key={`ctx-${message.ea_guid}`}><MessageContexts message={props.message} /></TableCell>
        <TableCell>
            <UsedMethods message={props.message}></UsedMethods>
        </TableCell>
    </TableRow>
}

function MessagesInstances({ messages }) {
    return <TableContainer component={Paper}>
        <Table size='smal'>
            <colgroup>
                <col style={{ width: '5%' }} />
                <col style={{ width: '5%' }} />
                <col style={{ width: '5%' }} />
                <col style={{ width: '5%' }} />
                <col style={{ width: '5%' }} />
                <col style={{ width: '5%' }} />
                <col style={{ width: '30%' }} />
            </colgroup>
            <TableHead>
                <TableRow key={-1} sx={{ width: 10 }}>
                    <TableCell ></TableCell>
                    <TableCell align="center">RPS, requests/sec</TableCell>
                    <TableCell align="center">Latency, ms</TableCell>
                    <TableCell align="center">Error Rate, %</TableCell>
                    <TableCell >Диаграмма</TableCell>
                    <TableCell >Контексты</TableCell>
                    <TableCell >Используемые методы</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {messages.map((m, i) => <Message message={m} key={i} />)}
            </TableBody>
        </Table>
    </TableContainer>
}


function InteractionCard({ interaction }) {
    const [open, setOpen] = React.useState(false);

    return (<React.Fragment>
        <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
            <TableCell>
                <IconButton
                    aria-label="expand row"
                    size="small"
                    onClick={() => setOpen(!open)}
                >
                    {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                </IconButton>
            </TableCell>
            <TableCell scope="row">
                {interaction.title}
            </TableCell>
            <TableCell scope="row">
                {interaction.notDefinedRPSCount ? alertText('---') : alertText(interaction.totalRPS, 'green')}
            </TableCell>
            <TableCell scope="row">
                {interaction.notDefinedLatencyCount ? alertText('---') : alertText(interaction.maxLatency, 'green')}
            </TableCell>
            <TableCell scope="row">
                {interaction.notDefinedErrorCount ? alertText('---') : alertText(interaction.minErrorRate, 'green')}
            </TableCell>
            <TableCell scope="row">
                {`${interaction.messages.length}[${interaction.messages.reduce((ret, v) => ret + v.contexts.length, 0)}]`}
            </TableCell>
        </TableRow>
        <TableRow>
            <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                <Collapse in={open} timeout="auto" unmountOnExit>
                    <Box sx={{ margin: 1, width: "100%" }}>
                        <Typography variant="h8" gutterBottom component={Paper}>
                            Контексты
                        </Typography>
                        <MessagesInstances messages={interaction.messages}></MessagesInstances>
                    </Box>
                </Collapse>
            </TableCell>
        </TableRow>
    </React.Fragment>)
}

export function InteractionsSection({ scenario }) {
    return <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />} component={Paper}><Link /><Box fontWeight='fontWeightMedium' display='inline'>Взаимодействия</Box></AccordionSummary>
        <AccordionDetails>
            <TableContainer component={Paper}>
                <Table size='small'>
                    <colgroup>
                        <col style={{ width: '5%' }} />
                        <col style={{ width: '30%' }} />
                        <col style={{ width: '5%' }} />
                        <col style={{ width: '5%' }} />
                        <col style={{ width: '5%' }} />
                        <col style={{ width: '5%' }} />
                        <col style={{ width: '5%' }} />
                    </colgroup>
                    <TableHead>
                        <TableRow key={0}>
                            <TableCell size="small">No</TableCell>
                            <TableCell>Название</TableCell>
                            <TableCell>RPS</TableCell>
                            <TableCell>Latency</TableCell>
                            <TableCell>Error Rate</TableCell>
                            <TableCell>Уникальных сообщений [всего используется]</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {Object.values(scenario.interactions).sort((a, b) => a.order - b.order).map((it, i) => <InteractionCard interaction={it} key={i} />)}
                    </TableBody>
                </Table>
            </TableContainer>
        </AccordionDetails>
    </Accordion>
}