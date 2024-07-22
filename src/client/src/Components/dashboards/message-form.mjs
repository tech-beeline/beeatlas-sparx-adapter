import React, { useEffect, useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { Button } from '@mui/material'
import { KeyboardArrowDown, KeyboardArrowUp, EditNote } from '@mui/icons-material';


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
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button type="submit">Subscribe</Button>
                </DialogActions>
            </DialogContent>
        </Dialog>
    </React.Fragment>
}