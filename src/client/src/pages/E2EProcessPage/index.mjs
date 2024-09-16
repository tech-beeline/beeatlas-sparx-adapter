import React, { useEffect, useState } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { WebEANaviLine } from "../../components/index.mjs";
import { E2ECatalogLink, HomeLink, MainBar } from "../../components/index.mjs";
import {
    Commit,
    ExpandMore,
    HourglassBottom,
    Signpost,
} from "@mui/icons-material";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Breadcrumbs,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from "@mui/material";
import { E2EProcessSelect } from "../../components/index.mjs";
import { E2E_API_RESOURCE } from "../../const.mjs";

export const E2EProcessSummary_URI = "/e2e/processes";

function E2ESummaryAccordion({ process, uid }) {
    return (
        <Accordion>
            <AccordionSummary component={Paper} expandIcon={<ExpandMore />}>
                <Signpost />
                <Box fontWeight="fontWeightMedium" display="inline">
                    Информация о Е2Е процессе
                </Box>
            </AccordionSummary>
            <TableContainer component={Paper}>
                <Table size="small">
                    <TableBody>
                        <TableRow>
                            <TableCell>Название</TableCell>
                            <TableCell>{process?.name}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Процесс в WebEA</TableCell>
                            <TableCell>
                                <WebEANaviLine text={process?.name} uid={uid} />
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Дашборд наблюдаемости</TableCell>
                            <TableCell>
                                Здесь будет ссылка на витрину в графане
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
            <AccordionDetails></AccordionDetails>
        </Accordion>
    );
}

function BusinessInteractionList({ interactions, process_uid }) {
    console.log(interactions);

    return (
        <Accordion>
            <AccordionSummary component={Paper} expandIcon={<ExpandMore />}>
                <Commit />
                <Box fontWeight="fontWeightMedium" display="inline">
                    Business Interactions
                </Box>
            </AccordionSummary>
            <AccordionDetails component={Paper}>
                {interactions ? (
                    interactions.length ? (
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Название</TableCell>
                                    <TableCell>
                                        Бизнес взаимодействие в WebEA
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {interactions.map((it) => (
                                    <TableRow key={it.ea_guid}>
                                        <TableCell>
                                            <NavLink
                                                to={`/e2e/${encodeURIComponent(
                                                    process_uid
                                                )}/bi/${encodeURIComponent(
                                                    it.ea_guid
                                                )}`}
                                            >
                                                {it.name}
                                            </NavLink>
                                        </TableCell>
                                        <TableCell>
                                            <WebEANaviLine
                                                text={it.name}
                                                uid={it.ea_guid}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <Box>Бизнес взаимодействия не найдены</Box>
                    )
                ) : (
                    <Box>
                        <HourglassBottom />
                        Loading....
                    </Box>
                )}
            </AccordionDetails>
        </Accordion>
    );
}

export function E2EProcessPage() {
    const { uid } = useParams();
    const navigate = useNavigate();

    const [process, setProcess] = useState(null);

    const [businessIneractions, setBusinessIneractions] = useState(null);

    const featchInteractions = async (processUID) => {
        const response = await fetch(
            `/api/v1/e2e-processes/${encodeURIComponent(
                processUID
            )}/business-interactions`
        );
        if (response.status !== 200) {
            return setBusinessIneractions({
                error: `HTTP STATUS: ${response.status} ( ${response.statusText})`,
                errorBody: await response.text(),
            });
        }
        setBusinessIneractions(await response.json());
    };

    const featchProcess = async (processUID) => {
        const response = await fetch(
            `${E2E_API_RESOURCE}/${encodeURIComponent(processUID)}`
        );
        if (response.status !== 200) {
            return setProcess({
                error: `HTTP STATUS: ${response.status} ( ${response.statusText})`,
                errorBody: await response.text(),
            });
        }
        setProcess(await response.json());
    };

    useEffect(() => {
        featchProcess(uid);
    }, []);
    useEffect(() => {
        featchInteractions(uid);
    }, [process]);

    const handleChangeProcess = (process) => {
        if (process) {
            navigate(`/e2e/${encodeURIComponent(process.uid)}`);
            featchProcess(process.uid);
            featchInteractions(process.uid);
        }
    };

    return (
        <div>
            <MainBar
                barContent={
                    <Breadcrumbs aria-label="breadcrumb">
                        <HomeLink />
                        <E2ECatalogLink />
                        <E2EProcessSelect
                            process={process}
                            onSelect={handleChangeProcess}
                        />
                    </Breadcrumbs>
                }
            />
            <E2ESummaryAccordion process={process} uid={process?.uid ?? uid} />
            <BusinessInteractionList
                interactions={businessIneractions}
                process_uid={process?.uid ?? uid}
            />
        </div>
    );
}
