import { KeyboardArrowDown, KeyboardArrowUp, Label, Title } from "@mui/icons-material";
import { Box, Collapse, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import React, { useEffect, useState } from "react"
import { useParams } from "react-router-dom";


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
export default function SystemPage() {
    const [system, setSystem] = React.useState(null)
    const { code } = useParams();

    async function loadData() {
        const response = await fetch(`/api/v1/systems/${code}?loadMethods=1`)
        if (response.status !== 200) {
            setSystem({ error: `HTTP STATUS: ${response.status} ( ${response.statusText})`, errorBody: await response.text() })
            return;
        }

        let apps = await response.json()

        setSystem(apps)
    }
    console.log(system)

    useEffect(() => {
        loadData();
    }, [])
    return system ?
        system.error ? <Box>Ошибка при загрузке данных: {system.error}</Box> :
            <Box component={Paper}>
                <Typography variant="h3" gutterBottom component={Paper}>{system.name}</Typography>
                <Box component={Paper}>
                    <Box>Код: {system.code}</Box>
                    <Box>Автор: {system.author}</Box>
                    <Box>Статус: {system.status}</Box>
                    <Box>Дата изменения: {system.modifiedDate}</Box>
                </Box>
                {system.description ? <Box>Описание: {system.description}</Box> : null}
                <Typography variant="h3">Контейнеры (Единицы развертывания)</Typography>
                <TableContainer component={Paper}>
                    <Table>
                        <colgroup>
                            <col style={{ width: "5%" }}></col>
                        </colgroup>

                        <TableHead>
                            <TableRow key="0">
                                <TableCell key="colapse"></TableCell><TableCell key="code">Код</TableCell><TableCell key="name">Имя</TableCell><TableCell key="version">Версия</TableCell><TableCell key="icoint">Количество интерфейсов</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {system.containers.map(c => <ContainerRow key={c.code} container={c} />)}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box> : <Box>Данные загружаются</Box>
}