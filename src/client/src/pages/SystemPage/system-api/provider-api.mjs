import { Box, Collapse, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { useFetchJSON } from "../../../utils/index.mjs";
import { Progress, TextField } from "@beeline/design-system-react";
import { useState } from "react";
import { SystemMetricTemplateInput } from "../grafana-sources/system-metric-template.mjs";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";

function ApiRow({ api }) {
    const [open, setOpen] = useState(false);
    const [methodFilter, setMethodFilter] = useState();

    console.log(methodFilter)


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
                                    console.log(e.target.value);
                                    setMethodFilter(e.target.value)
                                }}></TextField></TableCell>
                                <TableCell>Описание</TableCell>
                                <TableCell>Значение порогов</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {api.methods.filter(method => !methodFilter || method.name.toLowerCase().includes(methodFilter.toLowerCase()))
                                .map((method ,i)=>
                                    <TableRow key={i} hover>
                                        <TableCell>{method.name}</TableCell>
                                        <TableCell>{method.description}</TableCell>
                                        <TableCell>sla</TableCell>
                                    </TableRow>)}
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

