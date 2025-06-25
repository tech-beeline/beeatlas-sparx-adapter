import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Alert,
    Box,
    Button,
    Link,
    Paper,
    Typography
} from "@mui/material";
import { ScenarioApplicationDTO, ScenarioInterfaceDTO } from "../../model/scenario/scenario-application-dto.mjs";
import { useState } from "react";
import { Image, Launch } from "@mui/icons-material";
import { slaString } from "./utils.mjs";
import webeaLogo from "../../res/images/ea-icon.ico";
import structurizrLogo from "../../res/images/structurizr.png";
import { Table, TableBody, TableCell, TableData, TableHead, TableHeaderData, TableRow } from "@beeline/design-system-react";

/**
 * 
 * @param {methods:{}[]} props 
 * @returns 
 */
function C4MethodsPanel({ methods = [] }) {
    return <Box>
        <Table>
            <TableHead>
                <TableRow>
                    <TableHeaderData>Метод</TableHeaderData>
                    <TableHeaderData>Пороги</TableHeaderData>
                </TableRow>
            </TableHead>
            <TableBody>
                {methods.map(m => <TableRow key={m.uid}>
                    <TableData>{m.name}</TableData>
                    <TableData>{slaString(m)}</TableData>
                </TableRow>)}
            </TableBody>
        </Table>
    </Box>
}
/**
 * 
 * @param {methods:{}[]} props 
 * @returns 
 */
function SparxMethodsPanel({ methods }) {

    return <Box>
        <Table>
            <TableHead>
                <TableRow>
                    <TableHeaderData>Метод</TableHeaderData>
                    <TableHeaderData>Пороги из SPARX</TableHeaderData>
                    <TableHeaderData>Интерфейс в Structurizr</TableHeaderData>
                    <TableHeaderData>Пороги из Structurizr</TableHeaderData>

                </TableRow>
            </TableHead>
            <TableBody>
                {methods.map(m => <TableRow key={m.uid}>
                    <TableData>{m.name}</TableData>
                    <TableData>{slaString(m)}</TableData>
                    <TableData>{m.structurizr_map ? m.structurizr_map.length > 1 ? <Alert severity="warning">Найдено несколько : {m.structurizr_map.map(m => m.code).join(",")}</Alert> : <Alert>{m.structurizr_map[0].code}</Alert>
                        : <Alert severity="error">Не найден</Alert>}</TableData>
                    <TableData>{m.structurizr_map && m.structurizr_map.map(s => slaString(s)).join("|")}</TableData>
                </TableRow>)}
            </TableBody>
        </Table>
    </Box>
}
/**
 * 
 * @param {{api:ScenarioInterfaceDTO}} param0 
 * @returns 
 */
function ScenarioInterfacePanel({ api }) {
    console.log(api);
    return <Accordion defaultExpanded>
        <AccordionSummary>{api.source == "sparx" ? <img src={webeaLogo} width={24} /> : <img src={structurizrLogo} width={24} />}&nbsp;{api.title}</AccordionSummary>
        <AccordionDetails>
            {api.source == "sparx" ? <SparxMethodsPanel
                methods={api.methods} /> : <C4MethodsPanel methods={api.methods} />}
        </AccordionDetails>
    </Accordion>
}

/**
 * 
 * @param {{application: ScenarioApplicationDTO}} props
 * @returns 
 */
function ScenarioApplicationPanel({ application }) {
    return application && <Box>
        <Typography variant="h5">{application.title}
            <Link
                target="_blank"
                href={`/systems/${encodeURIComponent(application.code)}`}><Launch />На страницу системы</Link></Typography>
        {application.interfaces.filter(api => api.methods?.length).map(api => <ScenarioInterfacePanel api={api} />)}
    </Box>
}

/**
 * 
 * @param {{applications : ScenarioApplicationDTO[]}} props 
 * @returns 
 */
function AllInterfacesPanel({ applications }) {
    return <Box>
        {applications?.map(a => <ScenarioApplicationPanel application={a} key={a.code} />)}
    </Box>
}
/**
 * 
 * @param {{applications : ScenarioApplicationDTO[]}} props 
 * @returns 
 */
export function ScenarioApplications({ applications = [] }) {
    const [app, setApp] = useState();
    const select_app = (t) => {
        setApp(t);
    }
    return (
        <Box sx={{ display: "flex" }}>
            <Box>
                <Box><Button onClick={() => select_app(null)}>Все интерфейсы</Button></Box>
                {applications.sort((a, b) => a.name.localeCompare(b.name)).map(app => (<Box key={app.code}>
                    <Button onClick={() => select_app(app)}>{app.name}</Button></Box>
                ))}
            </Box>
            <Paper style={{ maxHeight: "calc(100vh - 100px)", overflow: 'auto' }}>
                {app ? <ScenarioApplicationPanel application={app} /> : <AllInterfacesPanel applications={applications} />}
            </Paper>
        </Box>
    )
}