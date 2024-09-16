import { Alarm } from "@mui/icons-material";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { useState } from "react";

export default function CreateSystemDashboard({ system, setOpen }) {
    const [inProgress, setInProgress] = useState(false);
    const [error, setError] = useState(null);

    async function CreateDashboardDialog() {
        setInProgress(true);
        const options = {
            method: "POST", body: JSON.stringify({ cmdb: system.code }),
            headers: {
                "Content-Type": "application/json",
            }
        }


        
        const response = await fetch(`/api/v3/monitoring/system/publish`, options);
        setInProgress(false);
        if( response.status != 200){
            setError( await response.text())
            return ;
        }
        setOpen(false)
    }

    return (
        <Dialog
            open={true}
            onClose={() => setOpen(false)}
            maxWidth="true"
            PaperProps={{
                component: 'form',
                onSubmit: (event) => {
                    event.preventDefault();
                    CreateDashboardDialog();

                }
            }}
        >
            <DialogTitle>Создать/обновить дашборд продукта {system?.name}</DialogTitle>
            <DialogContent>
                {error?<DialogContentText color="red"><Alarm/>{error}</DialogContentText>:null}
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setOpen(false)}>Закрыть</Button>
                <Button type="submit" disabled={inProgress}>Создать</Button>
            </DialogActions>
        </Dialog>
    )
}