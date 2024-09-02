//import { NavLink, useParams } from "react-router-dom";
import React, { useEffect, useState } from 'react';
//import '../../css/e2e-scenario.css'

import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box, Typography, Autocomplete, TextField, Popper } from '@mui/material';
import { MainBar } from '../Menu/main-bar.mjs';
import E2EProcessList from './e2e-process-list.mjs';
import { makeStyles } from '@mui/styles';
import { SearchBox } from '../Menu/search.mjs';
import { E2E_API_RESOURCE } from '../const.mjs';




export default function E2EProcessesListPage() {

    const [e2eProcessList, setE2eProcessList] = useState(null);
    const [filter, setFilter] = useState(null)

    const loadProcessList = async () => {
        let response = await fetch(E2E_API_RESOURCE);
        if (response.status !== 200) {
            let body = await response.text();
            setE2eProcessList({ error: `Ошибка при загрузке данных ${response.status} ${body}` })
            return;
        }
        let data = await response.json();
        setE2eProcessList(data);
    }

    useEffect(() => {
        loadProcessList();
    }, []);


    return <><MainBar title="Каталог Е2Е процессов"
        barContent={
            <SearchBox setSearchText={setFilter} />
        } />
        {e2eProcessList ?
            e2eProcessList.error ?
                <Box component={Paper}>
                    Ошибка при получении данных: {e2eProcessList.error}
                </Box> :
                <E2EProcessList processList={(e2eProcessList ?? []).filter(process => !filter || process.name.toLowerCase().includes(filter?.toLowerCase()))} />
            : <img src="/images/loading.gif" style={{ display: "block", marginLeft: "auto", marginRight: "auto" }} />}
    </>
}
