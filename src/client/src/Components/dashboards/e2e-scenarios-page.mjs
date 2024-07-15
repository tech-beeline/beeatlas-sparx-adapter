import { NavLink, useParams } from "react-router-dom";
import React, { useEffect, useState } from 'react';
import '../css/e2e-scenario.css'
import { Interaction, Scenario } from "./scenario-model.mjs";
import Table from '@mui/material/Table/Table.js';
import TableBody from '@mui/material/TableBody/TableBody.js';
import TableCell from '@mui/material/TableCell/TableCell.js';
import TableContainer from '@mui/material/TableContainer/TableContainer.js';
import TableHead from '@mui/material/TableHead/TableHead.js';
import TableRow from '@mui/material/TableRow/TableRow.js';
import Paper from '@mui/material/Paper/Paper.js';
import { FilterState, InteractionFilter } from "./interactions-filter.mjs";
import IconButton from '@mui/material/IconButton/IconButton.js';
import { KeyboardArrowDown } from '@mui/icons-material';
import { KeyboardArrowUp } from '@mui/icons-material';
import Collapse from '@mui/material/Collapse/Collapse.js';
import { Box, Typography } from "@mui/material";

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

function ScenarioHeader({ uid }) {
    return <div><h2>UID : {uid}</h2></div>
}

function alertText(txt, color = "red") {
    return <b><font color={color}>{txt}</font></b>
}

function ContextRow({ message }) {
    return <TableRow>
        <TableCell>{message.seqno}</TableCell>
        <TableCell>{message.stackTrace}</TableCell>
        <TableCell>{message.interfaceAgreement ? <a href={message.interfaceAgreement.path} target="_blank">{message.interfaceAgreement.yaml?.status}</a> : alertText("---")}</TableCell>
        <TableCell>{isNaN(message.rps) ? alertText('---') : alertText(message.rps, "green")}</TableCell>
        <TableCell>{isNaN(message.latency) ? alertText('---') : alertText(message.latency, "green")}</TableCell>
        <TableCell>{isNaN(message.errorRate) ? alertText('---') : alertText(message.errorRate, "green")}</TableCell>
        <TableCell>{message.validationError?.length ? message.validationError: alertText("Нет", "green")}</TableCell>
        <TableCell><a target="_blank" href={`https://ms-seaapp001.bee.vimpelcom.ru:83/?m=1&o=${message.diagram_uid}`}>{message.diagram}</a></TableCell>
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
                <col style={{ width: '20%' }} />
            </colgroup>
            <TableHead>
                <TableRow>
                    <TableCell size="small">seqno</TableCell>
                    <TableCell>Контекст</TableCell>
                    <TableCell>IA</TableCell>
                    <TableCell>RPS</TableCell>
                    <TableCell>Latency</TableCell>
                    <TableCell>Error Rate</TableCell>
                    <TableCell>Ошибки описания</TableCell>
                    <TableCell>Диаграмма</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {messages.map(m => <ContextRow message={m} />)}
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
                {interaction.validationErrorCount ? alertText("Есть") : alertText("Нет", "green")}
            </TableCell>
        </TableRow>
        <TableRow>
            <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                <Collapse in={open} timeout="auto" unmountOnExit>
                    <Box sx={{ margin: 1 }}>
                        <Typography variant="h6" gutterBottom component="div">
                            Контексты
                        </Typography>
                        <ContextList messages={interaction.messages}></ContextList>
                    </Box>
                </Collapse>
            </TableCell>
        </TableRow>
    </React.Fragment>)
    /*
    <div>{interaction.title} [{status_list.reduce((acc, v, i) => i > 1 ? [...acc, ";", v] : [acc, v])}]
        <span onClick={e => setShowDetails(!showDetails)} id='show-hide-application'>[{showDetails ? 'Скрыть детали' : 'Показать детали'}]</span>
        {showDetails ? <div>Контексты:<ContextList messages={interaction.messages} />
        </div> : null}
    </div>
    */
}




function InteractionList({ interactions }) {

    const [showState, setShowState] = useState(false);
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
                    </colgroup>
                    <TableHead>
                        <TableRow>
                            <TableCell size="small">No</TableCell>
                            <TableCell>Взаимодействие</TableCell>
                            <TableCell>Количество</TableCell>
                            <TableCell>IA</TableCell>
                            <TableCell>RPS</TableCell>
                            <TableCell>Latency</TableCell>
                            <TableCell>Error Rate</TableCell>
                            <TableCell>Ошибки описания</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {Object.values(interactions).filter(it => filterState?.check(it)).sort((a, b) => a.index - b.index).map(it => <InteractionCard interaction={it} />)}
                    </TableBody>
                </Table>
            </TableContainer>
        </div> : null}
    </div>
}

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

    const { uid } = useParams();

    return e2eScenario ?
        e2eScenario.error ? <div><h3>Ошибка при загрузке данных<br />{e2eScenario?.error}</h3><p>{e2eScenario.errorBody}</p></div> :
            <div>
                <ScenarioHeader uid={uid}></ScenarioHeader>
                <ApplicationList applications={e2eScenario?.scenario.applications ?? {}}></ApplicationList>
                <InteractionList interactions={e2eScenario.scenario.interactions ?? {}} />
            </div> : <img src="/images/loading.gif" style={{ display: "block", "margin-left": "auto", "margin-right": "auto" }} />
}