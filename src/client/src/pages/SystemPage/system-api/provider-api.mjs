import { Alert, Box, Collapse, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { useFetchJSON } from "../../../utils/index.mjs";
import { Progress, TextField, Tooltip } from "@beeline/design-system-react";
import { useState } from "react";
import { SystemMetricTemplateInput } from "../grafana-sources/system-metric-template.mjs";
import { KeyboardArrowDown, KeyboardArrowUp, Save } from "@mui/icons-material";


function MethodRow({ method }) {
    method.rps = method.rps ?? "";
    method.latency = method.latency ?? "";
    method.error_rate = method.error_rate ?? "";

    const [rps, setRps] = useState(method.rps)
    const [latency, setLatency] = useState(method.latency);
    const [error_rate, setError_rate] = useState(method.error_rate);
    const rpsError = rps && isNaN(+rps) && "Значение rps должно быть числом"
    const latencyError = latency && isNaN(+latency) && "Значение latency задается в виде количества миллисекунд";
    const errorRateError = error_rate && isNaN(+error_rate) && "Значение Error Rate должно быть числом (% ошибочных запросов)"

    const canSave = (!errorRateError && !latencyError && !rpsError) && (rps !== method.rps || latency !== method.latency || error_rate !== method.error_rate);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState();

    const onSave = async () => {
        setSaving(true);
        try {
            setSaveError(null);
            const response = await fetch(`/api/v4/methods-sla`, {
                method: "POST",
                body: JSON.stringify({
                    interface_uid: method.api_uid,
                    method_name: method.name,
                    rps: rps,
                    latency: latency,
                    error_rate: error_rate
                }),
                headers: {
                    "Content-Type": "application/json",
                }
            });
            if (response.status !== 200) {
                throw Error(await response.text())
            }
            const sla = await response.json();
            method.rps = sla.rps ?? "";
            method.latency = sla.latency ?? "";
            method.error_rate = sla.error_rate ?? "";
        } catch (e) {
            setSaveError(e.message);
        } finally {
            setSaving(false)
        }
    }

    return <TableRow hover>
        <TableCell>{method.name}</TableCell>
        <TableCell width={50}>
            <TextField label="RPS"
                disabled={saving}
                defaultValue={method.rps}
                error={rpsError}
                helperText={rpsError}
                onChange={(e) => setRps(e.target.value)} />
        </TableCell>
        <TableCell width={50}>
            <TextField
                label="Latency"
                defaultValue={method.latency}
                disabled={saving}
                error={latencyError}
                helperText={latencyError}
                onChange={(e) => setLatency(e.target.value)} />
        </TableCell>
        <TableCell width={50}>
            <TextField label="ErrorRate"
                defaultValue={method.error_rate}
                disabled={saving}
                error={errorRateError}
                helperText={errorRateError}
                onChange={(e) => setError_rate(e.target.value)} />
        </TableCell>
        <TableCell width={30}>
            {saving ? <Progress cycled shape="circle" size="mini" /> : <IconButton disabled={!canSave} onClick={onSave}>
                <Save />
            </IconButton>}
        </TableCell>
        <TableCell width={30}>
            {saveError && <Tooltip title={`Ошибка при обновлении SLA: ${saveError}`}><Box> <Alert severity="error"></Alert></Box></Tooltip>}
        </TableCell>
    </TableRow>
}

function ApiRow({ api }) {
    api.methods?.forEach((m, i) => m.key = i);

    const [open, setOpen] = useState(false);
    const [methodFilter, setMethodFilter] = useState();

    return (<><TableRow hover>
        <TableCell >
            {api?.methods?.length ? <IconButton size="small" onClick={() => setOpen(!open)} >{open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}</IconButton> : null}
        </TableCell>
        <TableCell>{api.name}</TableCell>
        <TableCell></TableCell>
        <TableCell><SystemMetricTemplateInput targetName={api.name} source={api.api_metric_template} /></TableCell>
    </TableRow>
        <TableRow>
            <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={4}>
                <Collapse in={open} timeout="auto" unmountOnExit>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell><TextField label="Метод" onChange={(e) => {
                                    setMethodFilter(e.target.value)
                                }}></TextField></TableCell>
                                <TableCell colSpan={3}>Значение порогов</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {api.methods.filter(method => !methodFilter || method.name.toLowerCase().includes(methodFilter.toLowerCase()))
                                .map((method, i) => <MethodRow method={{ ...method, api_uid: api.ea_guid }} key={method.key} />)}
                        </TableBody>
                    </Table>
                </Collapse>
            </TableCell>
        </TableRow>
    </>);
}

export function ProvidedApiBox({ app }) {
    const { error, data, loading } = useFetchJSON(`/api/v4/systems/${encodeURIComponent(app.code)}/p-api`, null, [app.code]);
    return (
        loading ? <Progress cycled /> :
            error ? <Box></Box> : data && <Box>
                <TableContainer component={Paper}>
                    <Table size="small">
                        <TableHead sx={{ backgroundColor: "gray" }}>
                            <TableRow>
                                <TableCell></TableCell>
                                <TableCell>Интерфейс</TableCell>
                                <TableCell>Техническая возможность</TableCell>
                                <TableCell>Источник метрик</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data.map(api => <ApiRow api={api} key={api.ea_guid} />)}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box >
    )
}

