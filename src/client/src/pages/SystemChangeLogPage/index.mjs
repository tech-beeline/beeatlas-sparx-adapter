import { useParams } from "react-router-dom"
import { SystemLink } from "../../components/index.mjs";
import { Alert, Box } from "@mui/material";
import {
    Header,
    IconButton,
    Table,
    TableBody,
    TableData,
    TableHead,
    TableHeaderData,
    TableRow
} from "@beeline/design-system-react";
import { useEffect } from "react";
import { useState } from "react";
import { loadChangeLog } from "../../resources/services/change-log-service.mjs";
import { Check, Error } from "@mui/icons-material";
import { LogDetailDialog } from "./components/log-detail.mjs";

export function SystemChangeLogPage() {
    const { code } = useParams();
    /** @type {[{ id, log_date, system_code, error}[]]} */
    const [log, setLog] = useState();
    const [error, setError] = useState();
    const [showRecord, setShowRecord] = useState();

    useEffect(() => {
        async function load(code) {
            await loadChangeLog(code, { setData: setLog, setError: setError });;
        }
        load(code);
    }, [code]);

    const Details = <LogDetailDialog record={showRecord} onClose={() => setShowRecord(null)}></LogDetailDialog>;

    return <Box>
        <Header>История изменений <SystemLink systemCode={code} /></Header>
        {error && <Alert severity="error">{error}</Alert>}
        <Box>
            {Details}
            {log &&
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableHeaderData></TableHeaderData>
                            <TableHeaderData>ID изменения</TableHeaderData>
                            <TableHeaderData>Дата</TableHeaderData>
                            <TableHeaderData>Ошибка</TableHeaderData>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {log.map(r => <TableRow>
                            <TableData>{(r.error ? <Error color="error" /> : <Check color="success" />)}
                                <IconButton iconName="archive" onClick={() => setShowRecord(r)}>Детально</IconButton></TableData>
                            <TableData>{r.id}</TableData>
                            <TableData>{new Date(r.log_date).toLocaleString()}</TableData>
                            <TableData>{r.error}</TableData>
                        </TableRow>)}
                    </TableBody>
                </Table>
            }
        </Box>
    </Box>
}