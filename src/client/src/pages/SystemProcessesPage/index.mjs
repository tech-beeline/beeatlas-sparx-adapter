import React, { useEffect, useState } from "react";
import {
    Autocomplete,
    Box,
    FormControl,
    List,
    ListItem,
    Paper,
    TextField,
} from "@mui/material";

export function SystemSelect({ onSelect }) {
    const [app_list, setAppList] = useState(null);

    const loadApplications = async () => {
        const response = await fetch(`/api/v1/systems`);
        if (response.status !== 200) {
            setAppList({
                error: `HTTP STATUS: ${response.status} ( ${response.statusText})`,
                errorBody: await response.text(),
            });
            return;
        }

        let apps = await response.json();

        setAppList(apps);
    };

    useEffect(() => {
        loadApplications();
    }, []);

    return (
        <Box>
            {app_list?.error ? <div>app_list?.error</div> : null}
            <FormControl>
                <h1>Выбор продукта</h1>
                <Autocomplete
                    disablePortal
                    options={app_list?.map?.((o, i) => ({
                        label: o.name,
                        code: o.code,
                    }))}
                    renderInput={(params) => (
                        <TextField {...params} label="Продукт" />
                    )}
                    onChange={(event, value) => onSelect?.(value)}
                ></Autocomplete>
            </FormControl>
        </Box>
    );
}

export function SystemProcessesPage() {
    const [process_list, setProcessList] = useState(null);
    const [app, setApp] = useState(null);

    async function loadAppProcesses(code) {
        const response = await fetch(`/api/v1/systems/${code}/e2e-processes`);
        if (response.status !== 200) {
            setProcessList({
                error: `HTTP STATUS: ${response.status} ( ${response.statusText})`,
                errorBody: await response.text(),
            });
            return;
        }

        setProcessList(await response.json());
    }

    function onSelectApp(sys) {
        setApp(sys);
        setProcessList(null);
        if (sys) loadAppProcesses(sys.code);
    }

    return (
        <div>
            <SystemSelect onSelect={onSelectApp} />
            {app ? (
                process_list ? (
                    process_list.error ? (
                        `Ошибка при загрузке данных : ${process_list.error}`
                    ) : (
                        <List component={Paper}>
                            {process_list.map((p) => (
                                <ListItem key={p.e2e_uid}>
                                    <a href={`/e2e/processes/${p.e2e_uid}`}>
                                        {p.e2e}
                                    </a>
                                </ListItem>
                            ))}
                        </List>
                    )
                ) : (
                    `Запрашивается информация для ${app.label}`
                )
            ) : null}
        </div>
    );
}
