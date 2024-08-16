import { KeyboardArrowDown, KeyboardArrowUp, Label, Title, Menu as MenuIcon, ExpandMore, SettingsApplications } from "@mui/icons-material";
import { Accordion, AccordionDetails, AccordionSummary, AppBar, Box, Collapse, IconButton, Menu, MenuItem, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Toolbar, Typography } from "@mui/material";
import React, { useEffect, useState } from "react"
import { useParams } from "react-router-dom";
import { ApplicationApi } from "./system-api.mjs";
import CreateSystemDashboard from "./system-create-dashboard.mjs";


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

function SystemHeader({ app }) {
    const [anchorMenu, setAnchorMenu] = useState(null)
    const [createDashbaordDialog, setCreateDashbaordDialog] = useState(false);

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
                <Toolbar>
                    <div>
                        <IconButton
                            size="large"
                            edge="start"
                            color="inherit"
                            aria-label="menu"
                            sx={{ mr: 2 }}
                            onClick={e => setAnchorMenu(e.currentTarget)}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Menu id='menu-appbar' anchorEl={anchorMenu} open={Boolean(anchorMenu)}
                            sx={{ mt: '45px' }}
                            onClose={() => setAnchorMenu(null)}
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}>
                            <MenuItem onClick={() => {
                                setCreateDashbaordDialog(true);
                                setAnchorMenu(null)
                            }}>Создать дашборд наблюдемости продукта</MenuItem>
                        </Menu>
                        {createDashbaordDialog ? <CreateSystemDashboard system={app} setOpen={setCreateDashbaordDialog} /> : null}
                    </div>
                    <Typography variant="h6">{app.name}</Typography>
                </Toolbar>
            </AppBar>
        </Box>
    )
}

function SystemSummary({ system }) {
    console.log(system)
    return (
        <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}><SettingsApplications />
                <Box fontWeight='fontWeightMedium' display='inline'>Информация о продукте</Box>
            </AccordionSummary>
            <AccordionDetails>
                <TableContainer component={Paper}>
                    <Table>
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

    async function loadData() {
        const response = await fetch(`/api/v1/systems/${code}?loadMethods=1`)
        if (response.status !== 200) {
            setSystem({ error: `HTTP STATUS: ${response.status} ( ${response.statusText})`, errorBody: await response.text() })
            return;
        }

        setSystem(await response.json())
    }
    console.log(system)
    useEffect(() => {
        loadData();
    }, [])
    return system ?
        system.error ? <Box>Ошибка при загрузке данных: {system.error}</Box> :
            <Box component={Paper}>
                <SystemHeader app={system} />
                <SystemSummary system={system} />
                <ApplicationApi system={system} />
            </Box> : <Box>Данные загружаются</Box>
}