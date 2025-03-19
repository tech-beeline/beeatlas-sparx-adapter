import { ExpandMore, MonitorHeartOutlined } from "@mui/icons-material";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow
} from "@mui/material";

import { Progress } from '@beeline/design-system-react';
import { useFetchJSON } from "../../../utils/index.mjs";
import {
    MONITORING_CONTAINER_SOURCE_RESOURCE,
    MONITORING_INTERFACES_SOURCE_RESOURCE,
    MONITORING_OBJECT_SOURCE_RESOURCE,
    systemApiMonitoringPath
} from "../../../resources/services.mjs";

import { SystemMetricTemplateInput } from "./system-metric-template.mjs";


const saveSystemApiTemplate = async (code, apiMetricTemplate) => {
    const response = await fetch(systemApiMonitoringPath(code), {
        method: "POST",
        body: JSON.stringify({
            apiMetricTemplate: apiMetricTemplate
        }),
        headers: {
            "Content-Type": "application/json",
        }
    });
    if (response.status !== 200) {
        throw Error(await response.text())
    }
}

const saveObjectApiTemplate = async (object_id, apiMetricTemplate) => {
    const response = await fetch(MONITORING_OBJECT_SOURCE_RESOURCE, {
        method: "POST",
        body: JSON.stringify({
            object_id: object_id,
            apiMetricTemplate: apiMetricTemplate
        }),
        headers: {
            "Content-Type": "application/json",
        }
    });
    if (response.status !== 200) {
        throw Error(await response.text())
    }
}

function ContainerAccordion({ containerMonitoring }) {

    const onContainerTemplateSave = async (value) => {
        const response = await fetch(MONITORING_CONTAINER_SOURCE_RESOURCE, {
            method: "POST",
            body: JSON.stringify({
                container_code: containerMonitoring.code,
                apiMetricTemplate: value
            }),
            headers: {
                "Content-Type": "application/json",
            }
        });
        if (response.status !== 200) {
            throw Error(await response.text())
        }
    }

    const onInterfacesTemplateSave = async (interfaceCode, value) => {
        const response = await fetch(MONITORING_INTERFACES_SOURCE_RESOURCE, {
            method: "POST",
            body: JSON.stringify({
                interfaceCode: interfaceCode,
                apiMetricTemplate: value
            }),
            headers: {
                "Content-Type": "application/json",
            }
        });
        if (response.status !== 200) {
            throw Error(await response.text())
        }
    }

    return <Accordion>
        <AccordionSummary component={Paper} expandIcon={<ExpandMore />}><MonitorHeartOutlined />
            <Box fontWeight='fontWeightMedium' display='inline'>[{containerMonitoring.code}] {containerMonitoring.name}</Box>
        </AccordionSummary>
        <AccordionDetails>
            Настройки метрик для контейнера: <SystemMetricTemplateInput
                targetName={containerMonitoring.name ?? containerMonitoring.code}
                source={containerMonitoring.source}
                onSave={onContainerTemplateSave}
            />
            <Table size="small">
                <TableHead><TableRow><TableCell>Интерфейс</TableCell><TableCell>Настройки метрик</TableCell></TableRow></TableHead>
                <TableBody>
                    {containerMonitoring.interfaces.map((api, i) => <TableRow hover key={i}>
                        <TableCell>{api.name}</TableCell>
                        <TableCell>
                            <SystemMetricTemplateInput
                                targetName={api.name}
                                source={api.source}
                                onSave={(value => onInterfacesTemplateSave(api.code, value))} /></TableCell>
                    </TableRow>)}
                </TableBody>
            </Table>
        </AccordionDetails>
    </Accordion>
}

function ProvidedInterfaceRow({ api }) {
    return (
        <TableRow>
            <TableCell>{api.name}</TableCell>
            <TableCell><SystemMetricTemplateInput targetName={api.name} source={api.api_metric_template}
                onSave={(value) => saveObjectApiTemplate(api.object_id, value)} />
            </TableCell>
        </TableRow>
    )
}

function ProvidedInterfacesAccordion({ providedAPIs }) {

    if (!providedAPIs?.length) return null;

    return <Accordion>
        <AccordionSummary component={Paper} expandIcon={<ExpandMore />}>
            <Box fontWeight='fontWeightMedium' display='inline'>Provided Interfaces</Box>
        </AccordionSummary>
        <AccordionDetails>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Интерфейс</TableCell>
                        <TableCell>Настройка</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {providedAPIs.map((api, i) => <ProvidedInterfaceRow key={i} api={api} />)}
                </TableBody>
            </Table>
        </AccordionDetails>
    </Accordion>
};

export function SystemApiMonitoringAccordion({ system }) {

    const { loading, data: apiMonitoring, error } = useFetchJSON(systemApiMonitoringPath(system.code), null, [system]);

    if (error) console.log(error);

    return (
        <Accordion>
            <AccordionSummary component={Paper} expandIcon={<ExpandMore />}><MonitorHeartOutlined />
                <Box fontWeight='fontWeightMedium' display='inline'>Наблюдаемость API</Box>
            </AccordionSummary>
            <AccordionDetails>
                {loading ?
                    <Progress cycled style={{
                        display: "block",
                        marginLeft: "auto",
                        marginRight: "auto",
                    }} /> :
                    error ? "ERROR" :
                        <div>
                            Настройки метрик API приложения <SystemMetricTemplateInput
                                targetName={system.name}
                                source={apiMonitoring.source}
                                onSave={(value) => {
                                    saveSystemApiTemplate(system.code, value);
                                }} />
                            {apiMonitoring.containers?.length ? (<Accordion>
                                <AccordionSummary component={Paper} expandIcon={<ExpandMore />}>
                                    <Box fontWeight='fontWeightMedium' display='inline'>Контейнеры</Box>
                                </AccordionSummary>
                                <AccordionDetails>
                                    {apiMonitoring.containers.map(c => <ContainerAccordion containerMonitoring={c} key={c.code} />)}
                                </AccordionDetails>
                            </Accordion>
                            ) : null}
                            {apiMonitoring.providedAPIs?.length ? <ProvidedInterfacesAccordion providedAPIs={apiMonitoring.providedAPIs} /> : ""}
                        </div>
                }
            </AccordionDetails>
        </Accordion>)
}