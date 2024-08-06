import React, { useEffect, useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from '@mui/material';
import { Button } from '@mui/material'
import { KeyboardArrowDown, KeyboardArrowUp, EditNote, ArrowUpward, ArrowLeft, ArrowBack, ArrowForward } from '@mui/icons-material';
import { tryParseFloat } from './scenario-model.mjs';

const POST_SLA_URL = "/api/v3/sla/interactions"

export default function MessageEditForm({ message, setMessage }) {
    const [open, setOpen] = React.useState(false);
    const [rps, setRPS] = React.useState([message.iaRPS, isNaN(message.rps) ? null : message.rps]);
    const [latency, setLatency] = React.useState([message.iaLatency, isNaN(message.latency) ? null : message.latency]);
    const [errorRate, setErrorRate] = React.useState([message.iaErrorRate, isNaN(message.errorRate) ? null : message.latency]);
    const [saveState, setSaveState] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
        setRPS([message.iaRPS, isNaN(message.rps) ? null : message.rps]);
        setLatency([message.iaLatency, isNaN(message.latency) ? null : message.latency])
        setErrorRate([message.iaErrorRate, isNaN(message.errorRate) ? null : message.errorRate])
    };

    const [alertMessage, setAlertMessage] = React.useState(null);

    const handleClose = () => {
        setOpen(false);
        setAlertMessage(null);
    }

    function error_message(num) {
        if (!num[1]) return "Значение должно быть заполнено";
        const parsed = tryParseFloat(num[1]);
        if (isNaN(parsed))
            return `${num[1]} Не явлется числом`;
    }
    const rps_errors = error_message(rps), latency_errors = error_message(latency), error_rate_errors = error_message(errorRate);

    function canSave() {
        return !rps_errors && !latency_errors && !error_rate_errors;
    }

    async function updateSLA() {
        try {
            console.log( message);
            if (!canSave()) return;
            let sla = { rps: rps[1], latency: Number(latency[1]) / 1000, errorRate: errorRate[1] }
            let options = {
                method: "POST", body: JSON.stringify(sla),
                headers: {
                    "Content-Type": "application/json",
                }
            }

            let response = await fetch(`${POST_SLA_URL}/${encodeURIComponent(message.ea_guid)}`, options);
            if (response.status !== 200) {
                const body = await response.text();
                setAlertMessage(`Не удалось обновить SLA : ${body}`)
                return;
            }
            message.rps = rps[1];
            message.latency = latency[1];
            message.errorRate = errorRate[1];
        } catch(err){
            setAlertMessage( err );
        }finally {
            setSaveState(false)
        }
        setMessage(Object.assign({}, message));
        handleClose();

    }

    return <React.Fragment>
        <Button variant="outlined" startIcon={<EditNote />} onClick={handleClickOpen}>Изменить</Button>
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="true"
            PaperProps={{
                component: 'form',
                onSubmit: (event) => {
                    event.preventDefault();
                    setSaveState(true);
                    updateSLA();
                },
            }}
        >
            <DialogTitle>{`${message.seqno} [${message.server_code}] ${message.server_name} - [${message.client_code}] ${message.client_name} ${message.name}`}</DialogTitle>
            <DialogContent>
                <DialogContentText>Изменение параметров сообщения</DialogContentText>

                <TextField label="RPS" disabled={saveState} error={rps_errors ? true : false} helperText={rps_errors} variant="standard" defaultValue={rps[1]} onChange={event => setRPS([rps[0], event.target.value])} />
                <TextField label="Latency" disabled={saveState} error={latency_errors ? true : false} helperText={latency_errors} variant="standard" defaultValue={latency[1]} onChange={event => setLatency([latency[0], event.target.value])} />
                <TextField label="Error Rate" disabled={saveState} error={error_rate_errors ? true : false} helperText={error_rate_errors} variant="standard" defaultValue={errorRate[1]} onChange={event => setErrorRate([errorRate[0], event.target.value])} />
                {alertMessage ? <DialogContentText color="red">{alertMessage}</DialogContentText> : null}
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button type="submit" disabled={saveState || !canSave()}>Save</Button>
                </DialogActions>
            </DialogContent>
        </Dialog>
    </React.Fragment>
}