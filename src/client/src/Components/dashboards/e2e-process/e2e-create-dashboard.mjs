import { Alarm } from "@mui/icons-material";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { useState } from "react";

const CREATE_DASHBOARD_PATH = `/api/v3/monitoring/bi/publish`
export function CreateDashboardDialog({ open, setOpen, scenario }) {
    const [alertMessage, setAlertMessage] = useState(null);
    const [creationInProcess, setCreationInProcess] = useState(false);

    const handleClose = () => {
        setAlertMessage(null)
        setOpen(false);
        setCreationInProcess(false);
    }

    async function createDashboard() {
        try {
            let options = {
                method: "POST", body: JSON.stringify({ code: scenario.guid }),
                headers: {
                    "Content-Type": "application/json",
                }
            }

            let response = await fetch(`${CREATE_DASHBOARD_PATH}`, options);
            if (response.status !== 200) {
                const body = await response.text();
                setCreationInProcess(false);
                setAlertMessage(`Не удалось создать дашборд : ${body}`)
                return;
            }
            setCreationInProcess(false); 
        } catch (err) {
            setAlertMessage(`Ошибка при создании дашборда: ${err.message}`)
        }
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
                    //setAlertMessage(`Пока не реализованно`);
                    setCreationInProcess(true);
                    createDashboard()
                },
            }}
        >
            <DialogTitle>Создать дашборд для сценария {scenario.name}</DialogTitle>
            <DialogContent>
                <DialogContentText>Создание дашборда для Е2Е процесса {scenario.name}</DialogContentText>
                {creationInProcess ? <DialogContentText color="blue">Идет процесс создания ....</DialogContentText> : null}
                {alertMessage ? <DialogContentText color="red"><Alarm color="red" /> {alertMessage}</DialogContentText> : null}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Закрыть</Button>
                <Button type="submit" disabled={creationInProcess}>Создать</Button>
            </DialogActions>
        </Dialog>
    )
}