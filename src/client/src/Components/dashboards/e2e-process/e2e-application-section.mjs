import { ExpandMore, KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { Accordion, AccordionDetails, AccordionSummary, Box, Collapse, IconButton, List, ListItem, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import React, { useState } from 'react';



function InterfaceSection({ apiList }) {
    const rows = apiList.reduce((acc, v) => [...acc, Object.values(v.methods).map((r, i, arr) => i ?
        <TableRow><TableCell>{r.name}</TableCell></TableRow> :
        <TableRow><TableCell rowSpan={arr.length}>{v.name}</TableCell><TableCell>{r.name}</TableCell></TableRow>
    )], [])
    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableCell>Интерфейс</TableCell><TableCell>Метод</TableCell>
                </TableHead>
                <TableBody>
                    {rows}
                </TableBody>
            </Table>
        </TableContainer>)
}
export function Application({ application }) {
    const [open, setOpen] = useState(false);
    console.log(application)
    return (
        <>
            <TableRow>
                <TableCell>
                    <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={() => setOpen(!open)}
                    >
                        {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                    </IconButton>
                </TableCell>
                <TableCell>{application.code}</TableCell><TableCell>{application.name}</TableCell>
                <TableCell>{Object.values(application.interfaces).reduce((r, v) => r + Object.values(v.methods).length, 0)}</TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={4}>
                    <Collapse in={open} unmountOnExit>
                        <InterfaceSection apiList={Object.values(application.interfaces)} />
                    </Collapse>
                </TableCell>
            </TableRow>
        </>)
}

export function ApplicationSection({ applications }) {
    return <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}><Box fontWeight='fontWeightMedium' display='inline'>Приложения</Box></AccordionSummary>
        <AccordionDetails>
            <TableContainer component={Paper}>
                <Table>
                    <colgroup>
                        <col style={{ widows: "5%" }}></col>
                        <col style={{ widows: "5%" }}></col>
                        <col style={{ widows: "50%" }}></col>
                    </colgroup>
                    <TableHead component={Paper}><TableRow>
                        <TableCell></TableCell><TableCell>cmdb</TableCell><TableCell>Имя</TableCell><TableCell>Количество используемых методов</TableCell>
                    </TableRow></TableHead>
                    <TableBody>
                        {Object.values(applications).map(app => <Application key={app.code} application={app} />)}
                    </TableBody>
                </Table>
            </TableContainer>
        </AccordionDetails>
    </Accordion>
}