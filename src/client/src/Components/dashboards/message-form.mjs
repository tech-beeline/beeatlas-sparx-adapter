import React, { useEffect, useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from '@mui/material';
import { Button } from '@mui/material'
import { KeyboardArrowDown, KeyboardArrowUp, EditNote, ArrowUpward } from '@mui/icons-material';


export default function MessageEditForm({ message }) {
    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
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
                    /*
                    const formData = new FormData(event.currentTarget);
                    const formJson = Object.fromEntries(formData.entries());
                    const email = formJson.email;
                    console.log(email);
                    */
                    //handleClose();
                },
            }}
        >
            <DialogTitle>{`${message.seqno} [${message.server.cmdb}] ${message.server.name} - [${message.client?.cmdb}] ${message.client?.name} ${message.method}`}</DialogTitle>
            <DialogContent>
                <DialogContentText>Изменение параметров сообщения</DialogContentText>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell></TableCell>
                                <TableCell>RPS</TableCell>
                                <TableCell>Latency</TableCell>
                                <TableCell>Error Rate</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow>
                                <TableCell>Interface Agreement</TableCell>
                                <TableCell><TextField id='ia-rps-value' label='RPS' defaultValue={message.iaRPS}></TextField><IconButton ><ArrowUpward/></IconButton></TableCell>
                                <TableCell><TextField id='ia-latency-value' label='Latency'></TextField></TableCell>
                                <TableCell><TextField id='ia-error-rate-value' label='ErrorRate'></TextField></TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Sparx EA</TableCell>
                                <TableCell><TextField id='ea-rps-value' label='RPS'></TextField></TableCell>
                                <TableCell><TextField id='ea-latency-value' label='Latency'></TextField></TableCell>
                                <TableCell><TextField id='ea-error-rate-value' label='ErrorRate'></TextField></TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button type="submit">Save</Button>
                </DialogActions>
            </DialogContent>
        </Dialog>
    </React.Fragment>
}