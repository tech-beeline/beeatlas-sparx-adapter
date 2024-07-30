import { Box, Button, Paper, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from "@mui/material";
import React, { useEffect, useRef } from "react"

function SearchFilter({ systems, setFilter, filter }) {
    const valueRef = useRef('')
    return <Box component={Paper}>
        <TextField label="Фильтр" variant="standard" defaultValue={filter} inputRef={valueRef} onChange={() => setFilter?.(valueRef.current.value)}
        />
    </Box>
}
export default function SearchSystemPage() {
    const [systems, setSystems] = React.useState(null)
    const [filter, setFilter] = React.useState('')

    async function loadData() {
        const response = await fetch(`/api/v1/systems`)
        if (response.status !== 200) {
            setSystems({ error: `HTTP STATUS: ${response.status} ( ${response.statusText})`, errorBody: await response.text() })
            return;
        }

        let apps = await response.json()

        setSystems(apps)
    }

    useEffect(() => {
        loadData();
    }, [])
    return systems ?
        systems.error ?
            <Box component={Paper}>Ошибка при загрузке данных {systems.error}</Box> :
            <Box>
                <SearchFilter systems={systems} filter={filter} setFilter={setFilter} />
                <TableContainer component={Paper}>
                    <Table>
                        <colgroup>
                            <col style={{ width: '5%' }} />
                            <col style={{ width: '30%' }} />
                        </colgroup>
                        <TableHead>
                            <TableRow>
                                <TableCell>Код продукта</TableCell>
                                <TableCell>Название</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {(filter.length > 0 ? systems.filter(s => s.code.includes(filter) || s.name.includes(filter)) : systems).map(s =>
                                <TableRow key={s.code}><TableCell>{s.code}</TableCell><TableCell><a href={`systems/${s.code}`}>{s.name}</a></TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box> :
        <Box>Данные загружаются....</Box>
}