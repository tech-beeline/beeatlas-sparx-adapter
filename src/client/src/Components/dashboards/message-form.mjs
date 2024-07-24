import React, { useEffect, useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from '@mui/material';
import { Button } from '@mui/material'
import { KeyboardArrowDown, KeyboardArrowUp, EditNote, ArrowUpward, ArrowLeft, ArrowBack, ArrowForward } from '@mui/icons-material';


export default function MessageEditForm({ message, setMessage }) {
    const [open, setOpen] = React.useState(false);
    const [rps, setRPS] = React.useState([message.iaRPS, isNaN(message.rps) ? null : message.rps]);
    const [latency, setLatency] = React.useState([message.iaLatency, isNaN(message.latency) ? null : message.latency]);
    const [errorRate, setErrorRate] = React.useState([message.iaErrorRate, isNaN(message.errorRate) ? null : message.latency]);

    console.log(message)

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
                    message.rps = rps[1];
                    message.latency = latency[1];
                    message.errorRate = errorRate[1];
                    setMessage(Object.assign({}, message));
                    handleClose();
                },
            }}
        >
            <DialogTitle>{`${message.seqno} [${message.server.cmdb}] ${message.server.name} - [${message.client?.cmdb}] ${message.client?.name} ${message.method}`}</DialogTitle>
            <DialogContent>
                <DialogContentText>Изменение параметров сообщения</DialogContentText>

                <TextField label="RPS" variant="standard" defaultValue={rps[1]} onChange={event => setRPS([rps[0], event.target.value])} />
                <TextField label="Latency" variant="standard" defaultValue={latency[1]} onChange={event => setLatency([latency[0], event.target.value])} />
                <TextField label="Error Rate" variant="standard" defaultValue={errorRate[1]} onChange={event => setErrorRate([errorRate[0], event.target.value])} />
                {alertMessage ? <DialogContentText>{alertMessage}</DialogContentText> : null}
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button type="submit">Save</Button>
                </DialogActions>
            </DialogContent>
        </Dialog>
    </React.Fragment>
}