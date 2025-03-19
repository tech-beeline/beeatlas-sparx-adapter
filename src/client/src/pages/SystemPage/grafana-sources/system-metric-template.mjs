import {
    Launch,
    Settings
} from "@mui/icons-material";

import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Paper,
    TextField
} from "@mui/material";

import { useState } from "react";
import { Link } from "react-router-dom";

const REGEX_NAME = /https:\/\/inside.beeline.ru\/d\/.*\/([a-zA-Z\-0-9]*)/;

function ChangeApiMetricDialog({ targetName, source = "", open, setOpen, onSave }) {

    const [changedSource, setChangedSource] = useState(source);
    const [saving, setSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);

    const handleSave = async (event) => {
        event.preventDefault();
        try {
            setErrorMessage(null);
            setSaving(true);
            if (!onSave) throw Error('Сохранение не поддерживается');

            await onSave(changedSource);

            setSaving(false);
            setOpen(false);
        } catch (error) {
            setErrorMessage(error.message);
        }
        setSaving(false);
    }

    return (<Dialog
        open={open}
        fullWidth
        maxWidth="true"
        PaperProps={{
            component: "form",
            onSubmit: (event) => {
                handleSave(event);
            }
        }}
    >
        <DialogTitle>
            Настройки мониторинга API для {targetName}
        </DialogTitle>
        <DialogContent>
            <Box component={Paper} height="100" sx={{ margin: 1 }}>
                <TextField
                    value={changedSource ?? ""}
                    label={`Ссылка на шаблон метрик в платформе наблюдаемости`}
                    fullWidth
                    onChange={(e) => setChangedSource(e.target.value)}
                    sx={{ margin: 1 }}
                />
                {errorMessage && <Box><DialogContentText color="red">{errorMessage}</DialogContentText></Box>}
            </Box>
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setOpen(false)}>Закрыть</Button>
            <Button autoFocus type="submit"
                disabled={changedSource === source || saving}
                onClick={handleSave}
            >
                Сохранить
            </Button>
        </DialogActions>
    </Dialog>);
}

export function SystemMetricTemplateInput({ targetName, source = "", onSave }) {

    const [open, setOpen] = useState(false);
    const [currentSource, setCurrentSource] = useState(source);

    const handleSave = async (value) => {
        await onSave(value);
        setCurrentSource(value)
    }
    const matched = currentSource?.match(REGEX_NAME);

    const name = matched?.length > 1 ? matched[1] : currentSource;

    const dialog = open ? <ChangeApiMetricDialog open={open} setOpen={setOpen} source={currentSource} targetName={targetName} onSave={handleSave}
    /> : null;

    return (
        currentSource ? <>
            <Link to={source} target="_blanc" title="Перейти в шаблон метрик">{<Launch />}</Link>
            <b>{name}</b><Link title="Изменить" onClick={() => {
                setOpen(true)
            }}>
                <Settings /></Link>{dialog}</> :
            <><Link onClick={() => {
                setOpen(true)
            }}><Settings /></Link>{dialog}</>
    );
}