import { KeyboardArrowDown, KeyboardArrowUp, Label, Title, Menu as MenuIcon, ExpandMore, SettingsApplications, Home, AddCard } from "@mui/icons-material";
import { Accordion, AccordionDetails, AccordionSummary, AppBar, Box, Breadcrumbs, Collapse, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Menu, MenuItem, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Toolbar, Typography } from "@mui/material";
import React, { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom";
import { ApplicationApi } from "./system-api.mjs";
import CreateSystemDashboard from "./system-create-dashboard.mjs";
import { MainBar } from "../../../Menu/main-bar.mjs";
import { SystemCapabilitiesAccordion } from "./system-capabilities.mjs";


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

function InterfaceRow({ api }) {
    const [open, setOpen] = useState(false);

    return <>
        <TableRow key={api?.code}>
            <TableCell>
                <IconButton
                    aria-label="expand row"
                    size="small"
                    onClick={() => setOpen(!open)}
                >
                    {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                </IconButton>
            </TableCell>
            <TableCell>{api.code}</TableCell>
            <TableCell>{api.protocol}</TableCell>
            <TableCell>{api.name}</TableCell>
            <TableCell>{api.version}</TableCell>
            <TableCell>{api.api_url}</TableCell>
        </TableRow >
        <TableRow>
            <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                <Collapse in={open} timeout="auto" unmountOnExit>
                    <Box sx={{ margin: 1, width: "100%" }}>
                        <Typography variant="h5" gutterBottom component="div">
                            Методы
                        </Typography>
                        <MethodsTable methods={api.methods}></MethodsTable>
                    </Box>
                </Collapse>
            </TableCell>
        </TableRow >
    </>
}

function InterfaceTable({ interfaces }) {
    return <TableContainer component={Paper}>
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell></TableCell><TableCell>Код</TableCell><TableCell>Протокол</TableCell><TableCell>Имя</TableCell><TableCell>Версия</TableCell><TableCell>Спецификация</TableCell><TableCell>TC</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {interfaces.map(i => <InterfaceRow key={i.code} api={i} />)}
            </TableBody>
        </Table>
    </TableContainer>
}
function ContainerRow({ container }) {
    const [open, setOpen] = useState(false);
    return <>
        <TableRow key={container?.code}>
            <TableCell key='expand'>
                <IconButton
                    aria-label="expand row"
                    size="small"
                    onClick={() => setOpen(!open)}
                >
                    {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                </IconButton>
            </TableCell>
            <TableCell key={container.code}>{container.code}</TableCell>
            <TableCell key={container.name}>{container.name}</TableCell>
            <TableCell key={container.version}>{container.version}</TableCell>
            <TableCell key="icount">{container.interfaces.length}</TableCell>
        </TableRow >
        <TableRow key={container?.code + 'colapse'}>
            <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
                <Collapse in={open} timeout="auto" unmountOnExit>
                    <Box sx={{ margin: 1, width: "100%" }}>
                        <Typography variant="h4" gutterBottom component="div">
                            Интерфейсы
                        </Typography>
                        <InterfaceTable interfaces={container.interfaces} />
                    </Box>
                </Collapse>
            </TableCell>
        </TableRow>
    </>
}


function SystemSummary({ system }) {
    console.log(system)
    return (
        <Accordion>
            <AccordionSummary component={Paper} expandIcon={<ExpandMore />}><SettingsApplications />
                <Box fontWeight='fontWeightMedium' display='inline'>Информация о продукте</Box>
            </AccordionSummary>
            <AccordionDetails>
                <TableContainer component={Paper}>
                    <Table size="small">
                        <colgroup>
                            <col width="15%">
                            </col></colgroup>
                        <TableBody>
                            <TableRow>
                                <TableCell>Название продукта</TableCell>
                                <TableCell>{system.name}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>CMDB мнемоника</TableCell>
                                <TableCell>{system.code}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Статус</TableCell>
                                <TableCell>{system.status}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Дата изменения</TableCell>
                                <TableCell>{system.modifiedDate}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Дашборд продукта</TableCell>
                                <TableCell><a href={`https://inside-dev.beeline.ru/d/archops-sys-${system.code}`} target="_blank">https://inside-dev.beeline.ru/d/archops-sys-{system.code}</a></TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            </AccordionDetails>
        </Accordion>
    )
}

export default function SystemPage() {
    const [system, setSystem] = React.useState(null)
    const { code } = useParams();
    const [dashboardDialogOpen, setDashboardDialogOpen] = useState(false);

    async function loadData() {
        const response = await fetch(`/api/v1/systems/${code}?loadMethods=1`)
        if (response.status !== 200) {
            setSystem({ error: `HTTP STATUS: ${response.status} ( ${response.statusText})`, errorBody: await response.text() })
            return;
        }

        setSystem(await response.json());
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
        <Typography
            sx={{ display: 'flex', alignItems: 'center' }}
            color="text.primary">
            {system?.name}
        </Typography>
    </Breadcrumbs>
    console.log(system)
    useEffect(() => {
        loadData();
    }, [])

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
                <SystemCapabilitiesAccordion system={system} />
                <ApplicationApi system={system} />
            </Box> : <Box>Данные загружаются</Box>
}