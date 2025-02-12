import { AddCard, Alarm, Edit } from "@mui/icons-material";
import { Autocomplete, Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, ListItemButton, ListItemIcon, ListItemText, Paper, TextField, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { OpenSearchProperties } from "./opensearch-source.mjs";
import { PrometheusProperties } from "./prometheus-source.mjs";
import { MON_SOURCES_URL } from "../../../resources/services.mjs";


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
const NEW_UID = '---'

function SelectGrafanaSource({ sourceList = [], source, setValue, disabled }) {
    const newSource = { name: "Новый источник", uid: NEW_UID };
    const noSource = { name: "Источник не задан" };
    source = source ?? noSource;

    const options = [newSource, noSource, ...sourceList ?? []];
    console.log({ label: source?.name ?? "", ...source })

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
//const SYSTEM_SOURCE_URL = '/api/v4/monitoring/systems/source';


function SourceProperties({ source, setSource, edit }) {
    if (!source || !source?.uid) { // Источник отсутствует
        return null;
    }

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

export function SystemSourceDialog({ system, open, setOpen }) {
    const [error, setError] = useState();
    const [inProgress, setInProgress] = useState(false);
    const [sourceList, setSourceList] = useState(null);
    const [selectedSource, setSelectedSource] = useState(null);
    const [systemSource, setSystemSource] = useState(null);
    const [edit, setEdit] = useState(null);

    const loadData = async () => {
        try {
            const loadSystemSource = async () => {
                const response = await fetch(`/api/v4/monitoring/systems/${encodeURIComponent(system.code)}/source`);
                await checkResponse(response);
                let source = await response.json();
                if (!source.uid) {
                    source = null;
                }
                return source;
            }

            const loadSourceList = async () => {
                const response = await fetch(MON_SOURCES_URL);
                await checkResponse(response);
                return await response.json();
            }

            const [system_source, source_list] = await Promise.all([
                loadSystemSource(),
                loadSourceList()
            ]);
            
            setSourceList(source_list);
            setSystemSource(system_source);
            setSelectedSource(system_source);
        } catch (error) {
            setError(`Ошибка при загрузке реестра источников метрик: ${error.message}`);
        }
    }

    const handleClose = (event) => {
        event.stopPropagation();
        setOpen(false);
        setError(null);
        setSelectedSource(systemSource);
        if (edit) setEdit(null);
    }

    const handleSave = async (event) => {
        const saveLink = async (systemCode, sourceUID) => {
            const body = JSON.stringify({ uid: sourceUID ?? null })
            const response = await fetch(`/api/v4/monitoring/systems/${encodeURIComponent(systemCode)}/source`, {
                method: "POST",
                body: body,
                headers: {
                    "Content-Type": "application/json",
                }
            });
            await checkResponse(response)
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
        
        try {
            setInProgress(true);

            const src = (edit || selectedSource.uid === NEW_UID) ? (await saveSource(selectedSource)) : selectedSource;
            saveLink(system.code, src.uid);

            handleClose(event);
        } catch (error) {
            setError(`Ошибка при сохранении: ${error}`)
        } finally {
            setInProgress(false);
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    return (
        <Dialog
            open={open}
            onClose={() => setOpen(false)}
            fullWidth
            maxWidth="true"
            PaperProps={{
                component: 'form',
                onSubmit: (event) => {
                    event.preventDefault();
                    handleSave(event);
                }
            }}
        >
            <DialogTitle>
                Управление настройками источника продукта {system?.name}
            </DialogTitle>
            <DialogContent>
                {sourceList ?
                    <Box component={Paper} height="600px" sx={{ margin: 1 }}>
                        <SelectGrafanaSource disabled={inProgress} sourceList={sourceList} setValue={(val) => {
                            setSelectedSource(val);
                            setEdit(false);
                        }} source={selectedSource} />
                        {selectedSource?.uid === NEW_UID ? null : <Button onClick={() => setEdit(true)}><Edit />Редактировать свойства источника</Button>}
                        <SourceProperties
                            source={selectedSource}
                            edit={edit}
                            setSource={setSelectedSource} />
                        {error ? <DialogContentText color="red"><Alarm />{error}</DialogContentText> : null}
                    </Box> : <Box component={Paper}>
                        {error ? <DialogContentText color="red"><Alarm />{error}</DialogContentText> : <Typography>Данные загружаются</Typography>}
                    </Box>
                }
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Закрыть</Button>
                <Button autoFocus type="submit" disabled={inProgress || (systemSource?.uid == selectedSource?.uid && !edit)}>
                    Сохранить
                </Button>
            </DialogActions>
        </Dialog>);
}


export default function GrafanaSourceMenuItem({ system }) {
    const [open, setOpen] = useState(false);
    const handleClick = () => {
        setOpen(true);
    }

    return (
        <ListItemButton onClick={handleClick}>
            <ListItemIcon>
                <AddCard />
            </ListItemIcon>
            <ListItemText primary="Настройка источников в платформе наблюдаемости" />
            <SystemSourceDialog open={open} setOpen={setOpen} system={Object.assign({}, system)} />
        </ListItemButton>
    )
}