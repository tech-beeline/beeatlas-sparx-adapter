import React, { useEffect, useState } from "react";
import { Paper, Box } from "@mui/material";

import { MainBar, SearchBox } from "../../components/index.mjs";
import { ALL_SCENARIO_API_RESOURCE, E2E_API_RESOURCE } from "../../const.mjs";

import { E2EProcessList } from "./components/index.mjs";
import { Progress } from '@beeline/design-system-react';


function fliterProcesses(filter, processList) {

    if (!processList) return [];
    if (!filter || !filter.length) return processList;
    filter = filter.toLowerCase();
    const filterFn = (p) => p.name.toLowerCase().includes(filter);

    processList = processList.map(p => Object.assign({}, p, {
        scenarios: p.scenarios.filter(filterFn)
    }));
    return processList.filter(p => filterFn(p) || p.scenarios.length);
}

export function E2EProcessesListPage() {
    const [e2eProcessList, setE2eProcessList] = useState(null);
    const [filter, setFilter] = useState("");

    const loadProcessList = async () => {
        let response = await fetch(ALL_SCENARIO_API_RESOURCE);
        if (!response.ok) {
            let body = await response.text();
            setE2eProcessList({
                error: `Ошибка при загрузке данных ${response.status} ${body}`,
            });
            return;
        }
        /**@type {{ uid, name, process_uid, process_name}[]} */
        const data = await response.json();
        const process_map = data.reduce((a, v) => {
            const process = a[v.process_uid] ?? (a[v.process_uid] = { name: v.process_name, uid: v.process_uid, scenarios: [] })
            process.scenarios.push(v);
            return a;
        }, {});

        console.log(process_map)
        setE2eProcessList(Object.values(process_map));
    };

    useEffect(() => {
        loadProcessList();
    }, []);

    return (
        <>
            <MainBar
                title="Каталог Е2Е процессов"
                barContent={<SearchBox setSearchText={setFilter} />}
            />
            {e2eProcessList ? (
                e2eProcessList.error ? (
                    <Box component={Paper}>
                        Ошибка при получении данных: {e2eProcessList.error}
                    </Box>
                ) : (
                    <E2EProcessList processList={fliterProcesses(filter, e2eProcessList)} />
                )
            ) : (
                <Progress shape="circle" />
            )}
        </>
    );
}
