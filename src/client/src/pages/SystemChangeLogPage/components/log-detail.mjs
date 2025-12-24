import { Button, Dialog, DialogContent } from "@beeline/design-system-react";
import { Box, DialogTitle } from "@mui/material";

export function LogDetailInfo({ record }) {
    return <Box>
        <Box>Дата изменения: {record.log_date}</Box>
    </Box>
}

export function LogDetailDialog({ record, onClose }) {
    console.log(record);
    return <Dialog open={record && 1}>
        <DialogContent  title="Детальная информация" footer={<Button onClick={onClose}>Закрыть</Button>}>
        </DialogContent>

    </Dialog >
}