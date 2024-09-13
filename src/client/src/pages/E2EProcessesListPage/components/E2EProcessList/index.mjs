import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from "@mui/material";
import { NavLink } from "react-router-dom";

export function E2EProcessList({ processList }) {
    return (
        <TableContainer component={Paper}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Название процесса</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {(processList ?? []).map((process) => (
                        <TableRow hover key={process.uid}>
                            <TableCell>
                                <NavLink
                                    to={`/e2e/${encodeURIComponent(
                                        process.uid
                                    )}`}
                                >
                                    {process.name}
                                </NavLink>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
