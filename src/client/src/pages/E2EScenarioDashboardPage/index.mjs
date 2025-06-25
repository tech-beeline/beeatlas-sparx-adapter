import {
    useParams
} from "react-router-dom";

import React, { useEffect, useState } from "react";
import { Scenario } from "./scenario-model.mjs";
import {
    AddCard,
    Launch
} from "@mui/icons-material";

import {
    Box,
    Breadcrumbs,
    Link,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
} from "@mui/material";
import { ApplicationSection } from "./e2e-application-section.mjs";
import { CallTraceSection } from "./e2e-call-trace-section.mjs";
import { CreateDashboardDialog } from "./e2e-create-dashboard.mjs";
import { InteractionsSection } from "./e2e-interactions-section.mjs";
import {
    E2ECatalogLink,
    E2EProcessLink,
    MainBar,
} from "../../components/index.mjs";

import { Progress } from '@beeline/design-system-react';


import { E2E_API_RESOURCE } from "../../const.mjs";

function ScenarioHeader({ scenario, process_uid }) {
    const [e2e, setE2E] = React.useState(null);
    const [showCreateDashboard, setShowCreateDashboard] = useState(false);

    useEffect(() => {
        const loadE2E = async () => {
            const response = await fetch(
                `${E2E_API_RESOURCE}/${encodeURIComponent(process_uid)}`
            );
            if (response.status !== 200) {
                setE2E({
                    error: `HTTP STATUS: ${response.status} ( ${response.statusText})`,
                    errorBody: await response.text(),
                });
                return;
            }
            //let scenario = new Scenario( await response.json)
            setE2E(await response.json());
        };

        loadE2E();
    }, [process_uid]);

    const createScenarioDashboard = () => {
        setShowCreateDashboard(true);
    };

    return (
        <Box sx={{ flexGrow: 1 }}>
            {scenario ? (
                <CreateDashboardDialog
                    open={showCreateDashboard}
                    setOpen={setShowCreateDashboard}
                    scenario={scenario}
                />
            ) : null}
            <MainBar
                barContent={
                    <Breadcrumbs aria-label="breadcrumb">
                        <E2ECatalogLink />
                        <E2EProcessLink title={e2e?.name} uid={e2e?.uid} />
                        <Typography>{scenario?.name}</Typography>
                    </Breadcrumbs>
                }
                contextMenu={
                    <List>
                        <ListItem key="create-dashboard" disablePadding>
                            <ListItemButton
                                onClick={() => {
                                    createScenarioDashboard(true);
                                }}
                            >
                                <ListItemIcon>
                                    <AddCard />
                                </ListItemIcon>
                                <ListItemText primary="Создать дашборд сценария" />
                            </ListItemButton>
                        </ListItem>
                    </List>
                }
            />
        </Box>
    );
}

export const E2EScenarioDashboard_URI = "/e2e-scenarios-dashboards";

export function E2EScenarioDashboardPage() {
    const { process_uid, uid } = useParams();
    const [e2eScenario, setE2EScenario] = useState(null);


    useEffect(() => {
        const loadScenario = async () => {
            const response = await fetch(
                `/api/v3/e2e/bi-scenarios/${encodeURIComponent(uid)}`
            );
            if (response.status !== 200) {
                setE2EScenario({
                    error: `HTTP STATUS: ${response.status} ( ${response.statusText})`,
                    errorBody: await response.text(),
                });
                return;
            }
            setE2EScenario(new Scenario(await response.json()));
        };

        loadScenario();
    }, [uid]);



    return (
        <>
            <ScenarioHeader
                scenario={e2eScenario?.info}
                process_uid={process_uid}
            ></ScenarioHeader>
            {e2eScenario ? (
                e2eScenario.error ? (
                    <div>
                        <h3>
                            Ошибка при загрузке данных
                            <br />
                            {e2eScenario?.error}
                        </h3>
                        <p>{e2eScenario.errorBody}</p>
                    </div>
                ) : (
                    <div>
                        <Box>
                            <Link target="_blank" href={`/e2e/${encodeURIComponent(process_uid)}/scenario/${uid}`}><Launch /> Новая версия</Link>
                        </Box>
                        <ApplicationSection
                            applications={e2eScenario.applications}
                        />
                        <CallTraceSection
                            callTree={e2eScenario.callTrace}
                        ></CallTraceSection>
                        <InteractionsSection scenario={e2eScenario} />
                    </div>
                )
            ) : (
                <div>
                    <Progress cycled style={{
                        display: "block",
                        marginLeft: "auto",
                        marginRight: "auto",
                    }} />
                </div>
            )}
        </>
    );
}
