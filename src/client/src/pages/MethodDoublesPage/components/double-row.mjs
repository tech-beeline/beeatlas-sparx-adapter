import {
    Delete,
    KeyboardArrowDown,
    KeyboardArrowUp,
    Login
} from "@mui/icons-material";
import {
    Table,
    TableBody,
    TableRow,
    TableCell,
    TableContainer,
    TableHead,
    Collapse,
    IconButton,
    Paper,
    Typography,
    Tooltip
} from "@mui/material";

import { useState } from "react";
import { DiagramList } from "./diagram-list.mjs";
import { DeleteMethodDialog } from "./delete-dialog.mjs";


export function DoubleRow({ name, methods }) {
    const [open, setOpen] = useState(true);

    const [openDelete, setOpenDelete] = useState();
    const onDelete = (method) => {
        setOpenDelete(method);
    }

    const deleteDialog = openDelete && <DeleteMethodDialog method={openDelete} open={openDelete} setOpen={setOpenDelete} />
    return <>
        <Typography variant="h5" marginLeft={10}> <IconButton size="small" onClick={() => setOpen(!open)} >{open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}</IconButton>
            {name}</Typography>
        {deleteDialog}
        <TableContainer component={Paper}    >
            <Collapse in={open}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell></TableCell>
                            <TableCell>Метод</TableCell>
                            <TableCell>Параметры</TableCell>
                            <TableCell>rps</TableCell>
                            <TableCell>latency</TableCell>
                            <TableCell>error_rate</TableCell>
                            <TableCell width={500}>Сценарии</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>{methods.map(m =>
                        <TableRow key={m.uid}>
                            <TableCell>
                                <Tooltip title="Удалить метод" ><IconButton
                                    onClick={() => onDelete(m)}
                                ><Delete /></IconButton></Tooltip>
                                <Tooltip title="Объединить дубли в этот метод"><IconButton><Login /></IconButton></Tooltip>
                            </TableCell>
                            <TableCell>{m.name}</TableCell>
                            <TableCell>{m.parameters}</TableCell>
                            <TableCell>{m.rps}</TableCell>
                            <TableCell>{m.latency}</TableCell>
                            <TableCell>{m.error_rate}</TableCell>
                            <TableCell><DiagramList diagrams={m.diagrams} /></TableCell>
                        </TableRow>)}
                    </TableBody>

                </Table>
            </Collapse>
        </TableContainer></>
}