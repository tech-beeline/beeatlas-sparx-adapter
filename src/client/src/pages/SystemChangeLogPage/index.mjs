import { useParams } from "react-router-dom"
import { SystemLink } from "../../components/index.mjs";
import { Box } from "@mui/material";
import { Header } from "@beeline/design-system-react";
import { useEffect } from "react";
import { useState } from "react";
import { loadChangeLog } from "../../resources/services/change-log-service.mjs";

export function SystemChangeLogPage() {
    const { code } = useParams();
    const [log, setLog] = useState();
    const [error, setError] = useState();

    useEffect(() => {
        async function load(code) {
            try {
                const data = await loadChangeLog(code);
            } catch (err) {
                setError(err.message);
            }
        }
        load(code);
    }, [code]);

    return <Box>
        <Header>История изменений <SystemLink systemCode={code} /></Header>
        <Box>{error}</Box>
    </Box>
}