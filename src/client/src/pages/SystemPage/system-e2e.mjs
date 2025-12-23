import { ExpandMore, SettingsApplications, Home, AddCard, Signpost } from "@mui/icons-material";
import { Accordion, AccordionDetails, AccordionSummary, Autocomplete, Box, Breadcrumbs, Chip, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material";
import React, { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom";
import CreateSystemDashboard from "./system-create-dashboard.mjs";
import { MainBar } from "../../components/index.mjs";
import { SystemSelect } from "./system-select.mjs";
import { SystemSummary } from "./system-summary.mjs";


function SelectOperation({ value, setValue, options }) {
    return (
        <Autocomplete
            value={value}
            multiple
            id="tags-filled"
            freeSolo
            onChange={(event, newValue) => {
                setValue(newValue);
            }}
            options={options}
            renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                    <Chip
                        variant="outlined"
                        label={option}
                        key={index}
                        {...getTagProps({ index })}
                    />
                ))
            }
            renderInput={(params) => (
                <TextField
                    {...params}
                    variant="filled"
                    label="Методы"
                    placeholder="Search"
                />
            )}>
        </Autocomplete>)
}

export function SystemE2EParticipion({ systemCode }) {


    const [participationList, setParticipationList] = useState(null);
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false);

    const [operationFilter, setOperationFilter] = useState([]);

    const processMap = {};
    const operationMap = {};

    for (const row of participationList ?? []) {
        if (!operationMap[row.message.operation.name]) operationMap[row.message.operation.name] = row.message.operation;

        if (operationFilter.length && !operationFilter.some(m => row.message.operation.name === m)) {
            continue;
        }
        const process = processMap[row.process.uid] ?? (processMap[row.process.uid] = { children: [], ...row.process });
        const operation_uid = row.message.operation?.uid;
        if (operation_uid) {
            let operation = process.children.find(r => r.uid === operation_uid);
            if (!operation) {
                operation = { count: 0, ...row.message.operation };
                process.children.push(operation);
            }
            operation.count++;
        }
    }

    useEffect(() => {
        const loadParticipations = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/v4/systems/${encodeURIComponent(systemCode)}/e2e`)
                if (response.status !== 200) {
                    throw Error(await response.text());
                }
                setOperationFilter([])
                setParticipationList(await response.json());
            } catch (error) {
                setError(error.message)
            } finally {
                setLoading(false);
            }
        }

        loadParticipations();
    }, [systemCode]);

    const processRows = (process) => {
        return process.children.map((r, i) => (
            i ? <TableRow key={i}><TableCell>{r.name}</TableCell><TableCell>{r.interface.name}</TableCell></TableRow> :
                <TableRow key={i}>
                    <TableCell rowSpan={process.children.length}><Link to={`/e2e/${encodeURIComponent(process.uid)}`}>{process.name}</Link></TableCell>
                    <TableCell>{r.name}</TableCell>
                    <TableCell>{r.interface.name}</TableCell>
                </TableRow>
        ))
    }

    const loadingAccodrion = loading ? <AccordionDetails></AccordionDetails> : null;
    const errorDetails = error ? <AccordionDetails>Ошибка: {error}</AccordionDetails> : null;
    const participationDetails = participationList ?
        <AccordionDetails>
            <SelectOperation value={operationFilter} setValue={setOperationFilter} options={Object.keys(operationMap)} />
            <TableContainer component={Paper}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Процесс</TableCell>
                            <TableCell>Метод</TableCell>
                            <TableCell>Интерфейс</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {Object.values(processMap).map(processRows)}
                    </TableBody>
                </Table>
            </TableContainer>
        </AccordionDetails> : null;

    return (
        <Accordion>
            <AccordionSummary component={Paper} expandIcon={<ExpandMore />}><Signpost />
                <Box fontWeight='fontWeightMedium' display='inline'>Участие в Е2Е процессах</Box>
            </AccordionSummary>
            {loadingAccodrion}
            {errorDetails}
            {participationDetails}
        </Accordion>
    )
}


export default function SystemE2EParticipionPage() {
    const [system, setSystem] = React.useState(null)
    const { code } = useParams();
    const [dashboardDialogOpen, setDashboardDialogOpen] = useState(false);
    const navigate = useNavigate()
    const [systemCode, setSystemCode] = useState(code);

    const handleSelectSystem = (sys) => {
        console.log(`select ${sys.code}`);
        navigate(`/systems/${sys.code.toLowerCode()}`);
        setSystemCode(sys.code)
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
        <Typography color="white">В каких процессах участвует</Typography>
    </Breadcrumbs>


    useEffect(() => {
        async function loadData(systemCode = code) {
            const response = await fetch(`/api/v1/systems/${systemCode}?loadMethods=1`) // [ ] Поменять на новую версию API
            if (response.status !== 200) {
                setSystem({ error: `HTTP STATUS: ${response.status} ( ${response.statusText})`, errorBody: await response.text() })
                return;
            }

            setSystem(await response.json());
        }

        loadData(systemCode);
    }, [systemCode, code])

    const contextMenu = <List>
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
                <SystemE2EParticipion systemCode={systemCode} />
            </Box> : <Box>Данные загружаются</Box>
}