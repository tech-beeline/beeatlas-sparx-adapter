import { AddCard } from "@mui/icons-material";
import {
    Box,
    Breadcrumbs,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Paper,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { SystemContainers } from "./system-api.mjs";
import CreateSystemDashboard from "./system-create-dashboard.mjs";
import { HomeLink, MainBar, SystemCatalogLink } from "../../components/index.mjs";
import { SystemCapabilitiesAccordion } from "./system-capabilities.mjs";
import { SystemSelect } from "./system-select.mjs";
import { SystemSummary } from "./system-summary.mjs";
import { SystemE2EParticipion } from "./system-e2e.mjs";
import GrafanaSourceMenuItem from "./grafana-sources/system-grafana-source.mjs";
import SystemAssessmentsAccordion from "./system-assessments.mjs";
import { apiSystemsPath } from "../../resources/services.mjs";

export function SystemPage() {
    const [system, setSystem] = React.useState(null);
    const { code } = useParams();
    const [dashboardDialogOpen, setDashboardDialogOpen] = useState(false);
    const navigate = useNavigate();

    console.log(system);

    async function loadData(systemCode = code) {
        const response = await fetch(apiSystemsPath(code));
        if (response.status !== 200) {
            setSystem({
                error: `HTTP STATUS: ${response.status} ( ${response.statusText})`,
                errorBody: await response.text(),
            });
            return;
        }

        setSystem(await response.json());
    }

    const handleSelectSystem = (sys) => {
        navigate(`/systems/${sys.code}`);
        loadData(sys.code);
    };

    useEffect(() => {
        loadData();
    }, []);

    const contextMenu = (
        <List>
            <GrafanaSourceMenuItem system={system} />
            <ListItem key="create-dashboard" disablePadding>
                <ListItemButton
                    onClick={() => {
                        setDashboardDialogOpen(true);
                    }}
                >
                    <ListItemIcon>
                        <AddCard />
                    </ListItemIcon>
                    <ListItemText primary="Создать дашборд системы" />
                </ListItemButton>
            </ListItem>
            {dashboardDialogOpen ? (
                <CreateSystemDashboard
                    system={system}
                    setOpen={setDashboardDialogOpen}
                />
            ) : null}
        </List>
    );

    return (
        <>
            <MainBar
                barContent={
                    <SystemSelect
                        system={system}
                        onSelect={handleSelectSystem}
                    />
                }
                contextMenu={contextMenu}
            />
            {system ? (
                system.error ? (
                    <Box>Ошибка при загрузке данных: {system.error}</Box>
                ) : (
                    <Box component={Paper}>
                        <SystemSummary system={system} />
                        <SystemCapabilitiesAccordion system={system} />
                        <SystemContainers system={system} />
                        <SystemE2EParticipion systemCode={system.code} />
                        <SystemAssessmentsAccordion system={system} />
                    </Box>
                )
            ) : (
                <Box>Данные загружаются</Box>
            )}
        </>
    );
}
