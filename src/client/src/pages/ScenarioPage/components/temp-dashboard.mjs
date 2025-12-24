import { Dialog, DialogContent, Progress, TextField, Typography } from "@beeline/design-system-react";
import { Alert, Box, DialogContentText, DialogTitle, Link } from "@mui/material";
import { publishSequenceDashboard } from "../../../resources/services/observability-service.mjs";
import { useRef, useState } from "react";
import { GRAFANA_URL } from "../../../resources/paths/index.mjs";

export function TempararyDashbaordDialog({ open, onClose, scenario }) {
    const [publishError, setPublishError] = useState();
    const [publishing, setPublishing] = useState();
    const nameRef = useRef(null);
    const [result, setResult] = useState(null);

    const createDashboard = async () => {
        try {
            if (!nameRef.current.value) {
                setPublishError("Надо заполнить значение идентификатора")
                return;
            }
            setPublishing(true);
            setPublishError(false);

            const tmp_scenario = Object.assign({}, scenario);
            if (scenario.name === nameRef.current.value) throw Error("Название временного дашборда не доллжэно совпадать с основным");
            tmp_scenario.name = nameRef.current.value;
            setResult(await publishSequenceDashboard(null, tmp_scenario));

            //onClose();
        } catch (err) {
            setPublishError(err.message);
        } finally {
            setPublishing(null);
        }
    }

    const handleClose = () => {
        setPublishError(null);
        onClose();
    }
    return <Dialog open={open} onClose={onClose}>
        <DialogContent actions={{
            cancel: {
                label: "Закрыть", onClick: handleClose,
            },
            confirm: {
                label: "Создать", onClick: createDashboard
            }
        }}>
            <DialogTitle>Создание временного дашборда</DialogTitle>
            <TextField label="Название дашборда" ref={nameRef}></TextField>
            {publishError && <Alert severity="error">{publishError}</Alert>}
            {publishing && <Box>Публикуем дашборд<Progress cycled shape="linear"></Progress></Box>}
            {result && <Box><Typography>Ссылка на созданный дашборд:</Typography><Link href={`${GRAFANA_URL}${result.url}`} target="_blank">{result.slug}</Link></Box>}
            <DialogContentText></DialogContentText>
        </DialogContent>
    </Dialog>
}