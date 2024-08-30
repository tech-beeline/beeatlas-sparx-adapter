import { KeyboardArrowDown, KeyboardArrowUp, SettingsApplications, Home, AddCard } from "@mui/icons-material";
import { Box, Breadcrumbs, Collapse, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import React, { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom";
import { SystemContainers } from "./system-api.mjs";
import CreateSystemDashboard from "./system-create-dashboard.mjs";
import { MainBar } from "../../../Menu/main-bar.mjs";
import { SystemCapabilitiesAccordion } from "./system-capabilities.mjs";
import { SystemSelect } from "./system-select.mjs";
import { SystemSummary } from "./system-summary.mjs";
import { SystemE2EParticipion } from './system-e2e.mjs'
import GrafanaSourceMenuItem from "./grafana-sources/system-grafana-source.mjs";


function MethodRow({ method }) {
    return <TableRow>
        <TableCell></TableCell><TableCell>{method.name}</TableCell><TableCell>{method.rps}</TableCell><TableCell>{method.latency}</TableCell><TableCell>{method.error_rate}</TableCell>
    </TableRow>
}
function MethodsTable({ methods }) {
    return <TableContainer>
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell></TableCell><TableCell>Имя</TableCell><TableCell>RPS</TableCell><TableCell>Latency</TableCell><TableCell>Error Rate</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>{methods.map(m => <MethodRow key={m.name} method={m} />)}</TableBody>
        </Table>
    </TableContainer>
}

export default function SystemPage() {
    const [system, setSystem] = React.useState(null)
    const { code } = useParams();
    const [dashboardDialogOpen, setDashboardDialogOpen] = useState(false);
    const navigate = useNavigate()


    async function loadData(systemCode = code) {
        const response = await fetch(`/api/v1/systems/${systemCode}?loadMethods=1`)
        if (response.status !== 200) {
            setSystem({ error: `HTTP STATUS: ${response.status} ( ${response.statusText})`, errorBody: await response.text() })
            return;
        }

        setSystem(await response.json());
    }

    const handleSelectSystem = (sys) => {
        navigate(`/systems/${sys.code}`);
        loadData(sys.code);
    }


    const breadcrumbs = <Breadcrumbs aria-label="breadcrumb">
        <Link underline="hover"
            sx={{ display: 'flex', alignItems: 'center' }}
            color="inherit"
            to="/"><Home />Архитектура
        </Link>
        <Link underline="hover"
            sx={{ display: 'flex', alignItems: 'center' }}
            color="inherit"
            to="/systems">
            <SettingsApplications />
            Каталог систем
        </Link>
        <SystemSelect system={{ label: system?.name, code: system?.code }} onSelect={handleSelectSystem} />
    </Breadcrumbs>


    useEffect(() => {
        loadData();
    }, [])

    const contextMenu = <List>
        <GrafanaSourceMenuItem system={system} />
        <ListItem key="create-dashboard" disablePadding>
            <ListItemButton onClick={() => { setDashboardDialogOpen(true) }}>
                <ListItemIcon>
                    <AddCard />
                </ListItemIcon>
                <ListItemText primary="Создать дашборд системы" />
            </ListItemButton>
        </ListItem>
        {dashboardDialogOpen ? <CreateSystemDashboard system={system} setOpen={setDashboardDialogOpen} /> : null}
    </List>

    return system ?
        system.error ? <Box>Ошибка при загрузке данных: {system.error}</Box> :
            <Box component={Paper}>
                <MainBar barContent={breadcrumbs} contextMenu={contextMenu} />
                <SystemSummary system={system} />
                <SystemCapabilitiesAccordion system={system} />
                <SystemContainers system={system} />
                <SystemE2EParticipion systemCode={system.code} />
            </Box> : <Box>Данные загружаются</Box>
}