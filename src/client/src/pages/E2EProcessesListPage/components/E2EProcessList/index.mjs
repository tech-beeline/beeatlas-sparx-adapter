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
                        <TableCell>Шаг процесса</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {(processList ?? []).map((process) => process.scenarios?.length ? process.scenarios.map((sc, i) => (
                        <TableRow hover key={sc.uid}>
                            {i ? "" : <TableCell rowSpan={process.scenarios.length}>
                                <NavLink to={`/e2e/${encodeURIComponent(process.uid)}`}>{process.name}</NavLink>
                            </TableCell>}
                            <TableCell>
                                <NavLink to={`/e2e/${encodeURIComponent(process.uid)}/scenario/${sc.uid}`}>{sc.name}</NavLink>
                            </TableCell>
                        </TableRow>
                    )) : (
                        <TableRow hover key={process.uid}>
                            <TableCell>
                                <NavLink to={`/e2e/${encodeURIComponent(process.uid)}`}>{process.name}</NavLink>
                            </TableCell>
                            <TableCell>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
