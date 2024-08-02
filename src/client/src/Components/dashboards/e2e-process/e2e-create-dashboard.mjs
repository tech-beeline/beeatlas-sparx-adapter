import { Alarm } from "@mui/icons-material";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { useState } from "react";


export function CreateDashboardDialog({ open, setOpen, scenario }) {
    const [alertMessage, setAlertMessage] = useState(null);

    const handleClose = () => {
        setAlertMessage(null)
        setOpen(false);
    }

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="true"
            PaperProps={{
                component: 'form',
                onSubmit: (event) => {
                    event.preventDefault();
                    setAlertMessage(`Пока не реализованно`);
                },
            }}
        >
            <DialogTitle>Создать дашборд для сценария {scenario.name}</DialogTitle>
            <DialogContent>
                <DialogContentText>Изменение параметров сообщения</DialogContentText>
                {alertMessage ? <DialogContentText color="red"><Alarm color="red"/> {alertMessage}</DialogContentText> : null}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Закрыть</Button>
                <Button type="submit">Создать</Button>
            </DialogActions>
        </Dialog>
    )
}