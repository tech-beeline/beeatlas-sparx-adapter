import { CorporateFare, Edit, ExpandMore, MonitorHeartOutlined } from "@mui/icons-material";
import { Accordion, AccordionDetails, AccordionSummary, Autocomplete, Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Paper, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from "@mui/material";
import { Progress } from '@beeline/design-system-react';
import { useEffect, useState } from "react";
import { useFetchJSON } from "../../../utils/index.mjs";
import { MON_SOURCES_URL, MONITORING_OBJECT_SOURCE_RESOURCE, systemApiMonitoringPath } from "../../../resources/services.mjs";
import { Link } from "react-router-dom";
import { SystemSourceDialog } from "./system-grafana-source.mjs";
import { OpenSearchProperties } from "./opensearch-source.mjs";
import { PrometheusProperties } from "./prometheus-source.mjs";


const OPENSEARECH_PROPETIES = {
    "Общее количество запросов": "opensearch-api-query-total",
    "Успнешные запросы": "opensearch-api-query-success",
    "Запросы, выполненные с ошибкой": "opensearch-api-query-error",
    "Время отклика": "opensearch-request-time-field"
}



const PROMETHEUS_PROPETIES = {
    "Общее количество запросов": "prometheus-api-total-filter",
    "Успнешные запросы": "prometheus-api-success-filter",
    "Запросы, выполненные с ошибкой": "prometheus-api-error-filter",
    "Счетчик общего времени вызовов API": "prometheus-api-sum",
    "Счетчик общего количества вызовов API": "prometheus-api-count"
}

const SOURCE_TYPES = {
    opensearch: OPENSEARECH_PROPETIES,
    prometheus: PROMETHEUS_PROPETIES
}



async function checkResponse(response) {
    console.log(response)
    if (response.status !== 200) {
        throw Error(await response.text())
    }
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
        throw Error("Oops, we haven't got JSON!");
    }
}


const saveLink = async (target, source) => {
    const body = JSON.stringify({ uid: source.uid ?? null })
    console.log(target, source);
    const response = await fetch(`/api/v4/monitoring/systems/${encodeURIComponent(target.code)}/source`, {
        method: "POST",
        body: body,
        headers: {
            "Content-Type": "application/json",
        }
    });
    await checkResponse(response);
}


const saveObjectSource = async (object_id, source) => {
    const body = JSON.stringify({ object_id: object_id, uid: source.uid ?? null })
    console.log(object_id, source);
    const response = await fetch(MONITORING_OBJECT_SOURCE_RESOURCE, {
        method: "POST",
        body: body,
        headers: {
            "Content-Type": "application/json",
        }
    });
    await checkResponse(response);
}

const saveSource = async (src) => {
    if (src.uid === NEW_UID) src.uid = undefined;

    const response = await fetch(MON_SOURCES_URL, {
        method: "POST",
        body: JSON.stringify(src),
        headers: {
            "Content-Type": "application/json",
        }
    });
    await checkResponse(response)
    return response.json();
}

function MonitoringSettingsDialog({ target, source, open, setOpen, setSource, handleSaveLink = saveLink }) {

    const [selectedSource, setSelected] = useState(source);
    const [edit, setEdit] = useState(null);
    const [error, setError] = useState(null);


    const handleClose = () => {
        setSelected(source);
        setEdit(false);
        setOpen(false);
    }

    const handleSave = async () => {
        try {
            let source = selectedSource;
            if (edit || selectedSource?.uid == NEW_UID) {

                setSelected(source = await saveSource(selectedSource));
            }
            await handleSaveLink(target, source);
            setSource?.(source);
            handleClose();
            //console.log(source.uid);
        } catch (error) {
            console.log(error);
            setError(error.message);
        }
    }

    return (
        <Dialog
            open={open}
            fullWidth
            maxWidth="true"
            PaperProps={{
                component: "form",
                onSubmit: (event) => {
                    event.preventDefault();
                    handleSave(event);
                }
            }}
        >
            <DialogTitle>
                Настройки мониторинга API для {target?.name}
            </DialogTitle>
            <DialogContent>
                <Box component={Paper} height="600px" sx={{ margin: 1 }}>
                    <SelectGrafanaSource source={selectedSource} setValue={setSelected} />
                    {selectedSource?.uid === NEW_UID ? null : <Button onClick={() => setEdit(true)}><Edit />Редактировать свойства источника</Button>}
                    <SourceProperties
                        edit={edit}
                        source={selectedSource}
                        setSource={setSelected} />
                </Box>
                {error && <Box><DialogContentText color="red">{error}</DialogContentText></Box>}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Закрыть</Button>
                <Button autoFocus type="submit" disabled={edit || selectedSource?.uid == source?.uid} >
                    Сохранить
                </Button>
            </DialogActions>
        </Dialog>
    )
}


function ContainerAccordion({ containerMonitoring }) {
    return <Accordion>
        <AccordionSummary component={Paper} expandIcon={<ExpandMore />}><MonitorHeartOutlined />
            <Box fontWeight='fontWeightMedium' display='inline'>[{containerMonitoring.code}] {containerMonitoring.name}</Box>
        </AccordionSummary>
        <AccordionDetails>
            Настройки метрик для контейнера: {containerMonitoring.source ? <Link to="" ><b>{containerMonitoring.source.name}</b></Link> :
                <>отсутствует <Link>Настроить</Link></>}
            <Table size="small">
                <TableHead><TableRow><TableCell>Интерфейс</TableCell><TableCell>Настройки метрик</TableCell></TableRow></TableHead>
                <TableBody>
                    {containerMonitoring.interfaces.map((api, i) => <TableRow hover key={i}>
                        <TableCell>{api.name}</TableCell>
                        <TableCell>{api.source ? <Button>{api.source.name}</Button> :
                            <Button>Добавить</Button>}</TableCell>
                    </TableRow>)}
                </TableBody>
            </Table>
        </AccordionDetails>
    </Accordion>
}

function ProvidedInterfaceRow({ api }) {

    const [monDialogOpen, setMonDialogOpen] = useState(false);
    const [source, setSource] = useState(api.source);


    const handleClick = () => {
        setMonDialogOpen(true);
    }



    const dialog = monDialogOpen ? <MonitoringSettingsDialog
        open={monDialogOpen}
        setOpen={setMonDialogOpen}
        source={source}
        handleSaveLink={async (t, s) => {
            console.log(t, s);
            await saveObjectSource(api.object_id, s);
            setSource(s.uid ? s : null);
        }}
        target={{ type: "api", code: api.object_id, name: api.name }}
    /> : null;


    return (
        <TableRow>
            <TableCell>{api.name}</TableCell>
            <TableCell>{source ?
                <Button onClick={() => handleClick()}>{source.name}</Button> :
                <Button onClick={() => handleClick()} >Добавить</Button>}
            </TableCell>
            {dialog}
        </TableRow>
    )
}

function ProvidedInterfacesAccordion({ providedAPIs }) {

    if (!providedAPIs?.length) return null;

    return <Accordion>
        <AccordionSummary component={Paper} expandIcon={<ExpandMore />}>
            <Box fontWeight='fontWeightMedium' display='inline'>Provided Interfaces</Box>
        </AccordionSummary>
        <AccordionDetails>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Интерфейс</TableCell>
                        <TableCell>Настройка</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {providedAPIs.map((api, i) => <ProvidedInterfaceRow key={i} api={api} />)}
                </TableBody>
            </Table>
        </AccordionDetails>
    </Accordion>
}

const NEW_UID = '---'

function SelectGrafanaSource({ source, setValue, disabled }) {
    const newSource = { name: "Новый источник", uid: NEW_UID };
    const noSource = { name: "Источник не задан" };
    source = source ?? noSource;

    const { loading: loadingSourceList, data: sourceList, error: errorLoadSources } = useFetchJSON(MON_SOURCES_URL);

    const options = [newSource, noSource, ...sourceList ?? []];

    return (
        <Autocomplete
            disabled={disabled}
            disablePortal
            isOptionEqualToValue={(a, b) => a.uid === b.uid}
            options={options.map(i => ({ label: i.name, ...i }))}
            onChange={(e, value) => {
                setValue?.(value);
            }}
            value={{ label: source?.name ?? "--", ...source }}
            renderInput={(params) =>
                <TextField {...params} label="Источник"
                ></TextField>}
        >
        </Autocomplete>
    )
}

function SourceProperties({ source, setSource, edit }) {
    if (!source || !source?.uid) { // Источник отсутствует
        return null;
    }

    console.log(source);

    const canEdit = (source.uid === NEW_UID) || edit;

    return <Box component={Paper} sx={{ margin: 1 }}>
        <Typography variant="h6">Значение настроек источника</Typography>
        <Autocomplete disabled={!canEdit}
            options={Object.keys(SOURCE_TYPES)}
            value={source.type ?? "--"}
            onChange={(e, v) => {
                const src = { type: v, ...source }
                setSource?.(src);
            }}
            renderInput={(params) => <TextField {...params} sx={{ margin: 1 }} label="Тип источника" ></TextField>}
        >
        </Autocomplete>
        {source.type === "opensearch" ? <OpenSearchProperties source={source} edit={canEdit} onChange={setSource} /> : null}
        {source.type === "prometheus" ? <PrometheusProperties source={source} edit={canEdit} onChange={setSource} /> : null}
    </Box>;
}

export function SystemApiMonitoringAccordion({ system }) {
    const [monDialogOpen, setMonDialogOpen] = useState(false);

    const [reload, setReload] = useState({ reload: false })

    const { loading, data: apiMonitoring, error } = useFetchJSON(systemApiMonitoringPath(system.code), null, [system, reload]);
    console.log(apiMonitoring);

    function handleViewAppSource() {
        setMonDialogOpen(true);
    }

    const dialog = monDialogOpen ? <MonitoringSettingsDialog
        open={monDialogOpen}
        setOpen={setMonDialogOpen}
        source={apiMonitoring?.source}
        target={{ type: "system", code: system.code, name: system.name }}
        setSource={() => setReload({ reload: false })}
    /> : null;

    if (error) console.log(error);

    return (
        <Accordion>
            <AccordionSummary component={Paper} expandIcon={<ExpandMore />}><MonitorHeartOutlined />
                <Box fontWeight='fontWeightMedium' display='inline'>Наблюдаемость API</Box>
            </AccordionSummary>
            <AccordionDetails>
                {loading ?
                    <Progress cycled style={{
                        display: "block",
                        marginLeft: "auto",
                        marginRight: "auto",
                    }} /> :
                    error ? "ERROR" :
                        <div>
                            Настройки метрик для приложения по умолчанию <Link to="" onClick={handleViewAppSource}>
                                <b>{apiMonitoring?.source ? apiMonitoring.source?.name : "Добавить"}</b></Link>
                            {apiMonitoring.containers?.length ? (<Accordion>
                                <AccordionSummary component={Paper} expandIcon={<ExpandMore />}>
                                    <Box fontWeight='fontWeightMedium' display='inline'>Контейнеры</Box>
                                </AccordionSummary>
                                <AccordionDetails>
                                    {apiMonitoring.containers.map(c => <ContainerAccordion containerMonitoring={c} key={c.code} />)}
                                </AccordionDetails>
                            </Accordion>
                            ) : null}
                            {apiMonitoring.providedAPIs?.length ? <ProvidedInterfacesAccordion providedAPIs={apiMonitoring.providedAPIs} /> : ""}
                        </div>
                }
            </AccordionDetails>
            {dialog}
        </Accordion>)
}