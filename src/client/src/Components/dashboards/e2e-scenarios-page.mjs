import { NavLink, useParams } from "react-router-dom";
import React, { useEffect, useState } from 'react';
import '../css/e2e-scenario.css'
import { Interaction, Scenario } from "./model/scenario-model.mjs";
import Table from '@mui/material/Table/Table.js';
import TableBody from '@mui/material/TableBody/TableBody.js';
import TableCell from '@mui/material/TableCell/TableCell.js';
import TableContainer from '@mui/material/TableContainer/TableContainer.js';
import TableHead from '@mui/material/TableHead/TableHead.js';
import TableRow from '@mui/material/TableRow/TableRow.js';
import Paper from '@mui/material/Paper/Paper.js';
import { FilterState, InteractionFilter } from "./interactions-filter.mjs";
import IconButton from '@mui/material/IconButton/IconButton.js';
import { KeyboardArrowDown, KeyboardArrowUp, EditNote } from '@mui/icons-material';
import Collapse from '@mui/material/Collapse/Collapse.js';
import { Box, List, ListItem, Typography } from "@mui/material";
import { TreeView, TreeItem } from '@mui/x-tree-view';

import MessageEditForm from "./message-form.mjs";
import { WebEANaviLine } from "../utils.mjs";
import { E2EDashboardMainPage_URI } from "./scenarios-main-page.mjs";
import { E2EProcessSummary_URI } from "./e2e-process-page.mjs";

function Application({ application }) {
    return <div><b>[{application.cmdb}] {application.name}</b></div>
}

function ApplicationList({ applications }) {

    const [showState, setShowState] = useState(false);

    return <div>
        <h2><span onClick={e => setShowState(!showState)} id='show-hide-application'>[{showState ? 'Скрыть системы' : 'Показать системы'}]</span></h2>
        {showState ? <div>{Object.values(applications).map(a => <Application application={a} />)}</div> : null}
    </div>
}

function ScenarioHeader({ scenario, process_uid }) {
    const [e2e, setE2E] = React.useState(null)

    const loadE2E = async () => {
        const response = await fetch(`/api/v1/e2e-processes/${encodeURIComponent(process_uid)}`)
        if (response.status !== 200) {
            setE2E({ error: `HTTP STATUS: ${response.status} ( ${response.statusText})`, errorBody: await response.text() })
            return;
        }
        //let scenario = new Scenario( await response.json)
        setE2E(await response.json())
    }

    useEffect(() => {
        loadE2E();
    }, [])


    return <div><h2>Business Interaction: {scenario.name} <WebEANaviLine uid={scenario.processUID}/> </h2>
        <h3>Е2Е процесс : {e2e ? e2e.error ? alertText(`Ошибка при загрукен данных: ${e2e.error}`) : <><a href={`${E2EProcessSummary_URI}/${encodeURIComponent(process_uid)}`}>{e2e.name}</a> <WebEANaviLine uid={process_uid} /></> : `Данные загружаются...`}</h3>
    </div>
}

function alertText(txt, color = "red") {
    return <b><font color={color}>{txt}</font></b>
}

const NO_DATA_MESSAGE = alertText('Нет')

function ContextRow(props) {
    const [message, setMessage] = useState(props.message);
    const rps_color = !isNaN(message.rps) ? "green" : "red";
    const latence_color = !isNaN(message.latency) ? "green" : "red";
    const error_color = !isNaN(message.errorRate) ? "green" : "red";

    return <TableRow key={message.message_uid}>
        <TableCell key={`edit-${message.message_uid}`}><MessageEditForm message={message} setMessage={setMessage} /></TableCell>
        <TableCell key={`ctx-${message.message_uid}`}><List>{message.stackTrace.map((c, i) => <ListItem kye={i}>{c}</ListItem>)}</List></TableCell>
        <TableCell key={`ia-${message.message_uid}`}>{message.interfaceAgreement ? <a href={message.interfaceAgreement.path} target="_blank">{message.interfaceAgreement.yaml?.status}</a> : alertText(NO_DATA_MESSAGE)}</TableCell>
        <TableCell key={`rps-${message.message_uid}`}>{isNaN(message.rps) ? alertText(NO_DATA_MESSAGE) : alertText(message.rps, rps_color)}</TableCell>
        <TableCell key={`latency-${message.message_uid}`}>{isNaN(message.latency) ? alertText(NO_DATA_MESSAGE) : alertText(message.latency, latence_color)}</TableCell>
        <TableCell key={`errorRate-${message.message_uid}`}>{isNaN(message.errorRate) ? alertText(NO_DATA_MESSAGE) : alertText(message.errorRate, error_color)}</TableCell>
        <TableCell key={`diagram-`}><a target="_blank" href={`https://ms-seaapp001.bee.vimpelcom.ru:83/?m=1&o=${message.diagram_uid}`}>{message.diagram}</a></TableCell>
    </TableRow>
}

function ContextList({ messages }) {
    return <TableContainer component={Paper}>
        <Table>
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
/**
 * 
 * @param {{interaction: Interaction}} param0 
 * @returns 
 */
function InteractionCard({ interaction }) {
    const [showDetails, setShowDetails] = useState(false);
    const [open, setOpen] = React.useState(false);

    function DependOn({ dependency }) {
        let dependency_tree = [];
        for (let t in dependency) {
            const d = dependency[t];
            let server = dependency_tree.find(it => it.cmdb === d.server.cmdb);
            if (!server) {
                dependency_tree.push(server = { cmdb: d.server.cmdb, name: d.server.name, usedApi: [] });
            }
            if (!server.usedApi.some(m => m === interaction.method)) server.usedApi.push(interaction.method)
        }
        return <Box sx={{ minWidth: 250 }}>
            {dependency_tree.length ?
                <TreeView defaultCollapseIcon={< KeyboardArrowUp />} defaultExpandIcon={<KeyboardArrowDown />}>
                    <TreeItem nodeId="root" label={`Используется систем: ${dependency_tree.length}`}>
                        {Object.values(dependency_tree).map((sys, i) => <TreeItem nodeId={sys.cmdb} itemID={sys.cmdb} label={`${sys.name} (используемых методов: ${sys.usedApi.length})`} key={i}>
                            {sys.usedApi.map((api, i) => <TreeItem nodeId={api} itemID={api} label={api} key={i}></TreeItem>)}
                        </TreeItem>)}
                    </TreeItem>
                </TreeView> : 'Нет'}
        </Box>
    }

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
            <TableCell component="th" scope="row">
                {interaction.title}
            </TableCell>
            <TableCell component="th" scope="row">
                {interaction.messages.length}
            </TableCell>
            <TableCell component="th" scope="row">
                {interaction.notDefinedIACount ? alertText("---") : "+"}
            </TableCell>
            <TableCell component="th" scope="row">
                {interaction.notDefinedRPSCount ? alertText("---") : interaction.totalRps}
            </TableCell>
            <TableCell component="th" scope="row">
                {interaction.notDefinedLatencyCount ? alertText("---") : interaction.maxLatency}
            </TableCell>
            <TableCell component="th" scope="row">
                {interaction.notDefinedErrorCount ? alertText("---") : interaction.minErrorRate}
            </TableCell>
            <TableCell component="th" scope="row">
                ---
            </TableCell>
            <TableCell component="th" scope="row">
                ---
            </TableCell>
            <TableCell component="th" scope="row">
                ---
            </TableCell>
            <TableCell align="left" component="th" scope="row">
                <DependOn dependency={interaction.dependOn} />
            </TableCell>
        </TableRow>
        <TableRow>
            <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={10}>
                <Collapse in={open} timeout="auto" unmountOnExit>
                    <Box sx={{ margin: 1, width: "100%" }}>
                        <Typography variant="h6" gutterBottom component="div">
                            Контексты
                        </Typography>
                        <ContextList messages={interaction.messages}></ContextList>
                    </Box>
                </Collapse>
            </TableCell>
        </TableRow>
    </React.Fragment>)
}




function InteractionList({ interactions }) {

    const [showState, setShowState] = useState(true);
    const [filterState, setFilterState] = useState(new FilterState());

    return <div><h2><span onClick={e => setShowState(!showState)} id='show-hide-application'>[{showState ? 'Скрыть взаимодействия' : 'Показать взаимодействия'}]</span></h2>
        {showState ? <div>
            <InteractionFilter filterState={filterState} setFilterState={setFilterState} />
            <TableContainer component={Paper}>
                <Table>
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
                        {Object.values(interactions).filter((it) => filterState?.check(it)).sort((a, b) => a.index - b.index).map((it, i) => <InteractionCard interaction={it} key={i} />)}
                    </TableBody>
                </Table>
            </TableContainer>
        </div> : null}
    </div>
}

export const E2EScenarioDashboard_URI = "/e2e-scenarios-dashboards"

export default function E2EScenarioDashboard() {
    const [e2eScenario, setE2EScenario] = useState(null);
    const loadScenario = async () => {
        const response = await fetch(`/api/v1/e2e-process-messages/${encodeURIComponent(uid)}`)
        if (response.status !== 200) {
            setE2EScenario({ error: `HTTP STATUS: ${response.status} ( ${response.statusText})`, errorBody: await response.text() })
            return;
        }
        //let scenario = new Scenario( await response.json)
        setE2EScenario({ scenario: new Scenario(await response.json()) })
    }

    useEffect(() => {
        loadScenario();
    }, [])

    const { process_uid, uid } = useParams();

    return e2eScenario ?
        e2eScenario.error ? <div><h3>Ошибка при загрузке данных<br />{e2eScenario?.error}</h3><p>{e2eScenario.errorBody}</p></div> :
            <div>
                <ScenarioHeader scenario={e2eScenario.scenario} process_uid={process_uid}></ScenarioHeader>
                <ApplicationList applications={e2eScenario?.scenario.applications ?? {}}></ApplicationList>
                <InteractionList interactions={e2eScenario.scenario.interactions ?? {}} />
            </div> : <img src="/images/loading.gif" style={{ display: "block", marginLeft: "auto", marginRight: "auto" }} />
}