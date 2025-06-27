import { Alert, AppBar, Box, Link, Tooltip } from "@mui/material";
import styles from "../../../components/Menu/Menu.module.css"
import { Launch } from "@mui/icons-material";
import { Button, IconButton, Toolbar, Typography } from "@beeline/design-system-react";
import { useEffect, useState } from "react";
import { loadProcessList, loadProcessScenarios } from "../../../resources/services/e2e-service.mjs";


export function ScenarioAppBar({ process_uid, uid }) {

    const [loading, setLoading] = useState();
    const [error, setError] = useState();
    /**@type {[{processList: { uid, name}[],scenarios:{ea_guid, bi_name}[]:}]} */
    const [processData, setProcessData] = useState();

    const loadData = async () => {
        try {
            setProcessData(null);
            setLoading(true);
            setError(null);

            setProcessData({ processList: await loadProcessList(), scenarios: await loadProcessScenarios(process_uid) });
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(null);
        }
    }
    useEffect(() => { loadData() }, [process_uid, uid]);

    const process = processData && processData.processList.find(p=>p.uid==process_uid);
    const scenario = processData && processData.scenarios.find(s=>s.ea_guid=uid);

    return <AppBar position="static" elevation={0} className={styles.appBar}>
        <Toolbar>
            <Typography>
                {scenario&&<Typography>{scenario.bi_name}</Typography> }
                {error && <Tooltip title={`Ошибка при загруки информации о процессе: ${error}`}><Alert severity="error"></Alert></Tooltip>}
            </Typography>
            <Link target="_blank" href={`/e2e/${encodeURIComponent(process_uid)}/bi/${uid}`}><Launch /> Старая версия</Link>
        </Toolbar>
    </AppBar>
}