import { ExpandMore, KeyboardArrowDown, KeyboardArrowUp, Link } from '@mui/icons-material';
import { Accordion, AccordionDetails, AccordionSummary, Box, Collapse, IconButton, List, ListItem, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import React, { useState } from 'react';
import { TreeItem, TreeView } from '@mui/x-tree-view';
import MessageEditForm from './message-form.mjs';


function alertText(txt, color = "red") {
    return <b><font color={color}>{txt}</font></b>
}

const NO_DATA_MESSAGE = alertText('Нет')

function ContextRow(props) {
    const [message, setMessage] = useState(props.message);
    const rps_color = !isNaN(message.rps) ? "green" : "red";
    const latence_color = !isNaN(message.latency) ? "green" : "red";
    const error_color = !isNaN(message.errorRate) ? "green" : "red";

    return <TableRow key={message.ea_guid}>
        <TableCell key={`edit-${message.ea_guid}`}><MessageEditForm message={message} setMessage={setMessage} /></TableCell>
        <TableCell key={`ctx-${message.ea_guid}`}><List>{message.stackTrace?.map((c, i) => <ListItem key={`${i}`}>{c}</ListItem>)}</List></TableCell>
        <TableCell key={`ia-${message.ea_guid}`}>{message.ia ? <a href={message.ia.path} target="_blank">{message.ia.content ? message.ia.content.yaml?.status : 'Не верная ссылка'}</a> : alertText(NO_DATA_MESSAGE)}</TableCell>
        <TableCell key={`rps-${message.ea_guid}`}>{isNaN(message.rps) ? alertText(NO_DATA_MESSAGE) : alertText(message.rps, rps_color)}</TableCell>
        <TableCell key={`latency-${message.ea_guid}`}>{isNaN(message.latency) ? alertText(NO_DATA_MESSAGE) : alertText(message.latency, latence_color)}</TableCell>
        <TableCell key={`errorRate-${message.ea_guid}`}>{isNaN(message.errorRate) ? alertText(NO_DATA_MESSAGE) : alertText(message.errorRate, error_color)}</TableCell>
        <TableCell key={`diagram-`}><a target="_blank" href={`https://ms-seaapp001.bee.vimpelcom.ru:83/?m=1&o=${message.d_uid}`}>{message.diagram}</a></TableCell>
    </TableRow>
}

function ContextList({ messages }) {
    return <TableContainer component={Paper}>
        <Table size='smal'>
            <colgroup>
                <col style={{ width: '5%' }} />
                <col style={{ width: '30%' }} />
                <col style={{ width: '5%' }} />
                <col style={{ width: '5%' }} />
                <col style={{ width: '5%' }} />
                <col style={{ width: '5%' }} />
                <col style={{ width: '40%' }} />
            </colgroup>
            <TableHead>
                <TableRow key={-1} sx={{ width: 10 }}>
                    <TableCell ></TableCell>
                    <TableCell >Контекст</TableCell>
                    <TableCell >IA</TableCell>
                    <TableCell align="center">RPS, requests/sec</TableCell>
                    <TableCell align="center">Latency, ms</TableCell>
                    <TableCell align="center">Error Rate, %</TableCell>
                    <TableCell >Диаграмма</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {messages.map((m, i) => <ContextRow message={m} key={i} />)}
            </TableBody>
        </Table>
    </TableContainer>
}


function InteractionCard({ interaction }) {
    const [showDetails, setShowDetails] = useState(false);
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
                {interaction.messages.length}
            </TableCell>
            <TableCell scope="row">
                {interaction.notDefinedIACount ? alertText('---') : alertText('+', "green")}
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
                ---
            </TableCell>
            <TableCell scope="row">
                ---
            </TableCell>
            <TableCell scope="row">
                ---
            </TableCell>
            <TableCell align="left" scope="row">
            </TableCell>
        </TableRow>
        <TableRow>
            <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={10}>
                <Collapse in={open} timeout="auto" unmountOnExit>
                    <Box sx={{ margin: 1, width: "100%" }}>
                        <Typography variant="h8" gutterBottom component={Paper}>
                            Контексты
                        </Typography>
                        <ContextList messages={interaction.messages}></ContextList>
                    </Box>
                </Collapse>
            </TableCell>
        </TableRow>
    </React.Fragment>)
}


export function InteractionsSection({ scenario }) {
    console.log(scenario)
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
                        <col style={{ width: '5%' }} />
                        <col style={{ width: '5%' }} />
                    </colgroup>
                    <TableHead>
                        <TableRow key={0}>
                            <TableCell size="small">No</TableCell>
                            <TableCell>Взаимодействие</TableCell>
                            <TableCell>Количество</TableCell>
                            <TableCell>IA</TableCell>
                            <TableCell>RPS</TableCell>
                            <TableCell>Latency</TableCell>
                            <TableCell>Error Rate</TableCell>
                            <TableCell>Протокол</TableCell>
                            <TableCell>TC</TableCell>
                            <TableCell>Источник метрик</TableCell>
                            <TableCell>От чего зависит</TableCell>
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