import React, { useEffect, useState } from "react";
import { Paper, Box } from "@mui/material";

import { MainBar, SearchBox } from "../../components/index.mjs";
import { E2E_API_RESOURCE } from "../../const.mjs";

import { E2EProcessList } from "./components/index.mjs";
import styles from "./E2EProcessesListPage.module.css";

export function E2EProcessesListPage() {
    const [e2eProcessList, setE2eProcessList] = useState(null);
    const [filter, setFilter] = useState("");

    const loadProcessList = async () => {
        let response = await fetch(E2E_API_RESOURCE);
        if (response.status !== 200) {
            let body = await response.text();
            setE2eProcessList({
                error: `Ошибка при загрузке данных ${response.status} ${body}`,
            });
            return;
        }
        let data = await response.json();
        setE2eProcessList(data);
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
                    <E2EProcessList
                        processList={(e2eProcessList ?? []).filter(
                            (process) =>
                                !filter ||
                                process.name
                                    .toLowerCase()
                                    .includes(filter?.toLowerCase())
                        )}
                    />
                )
            ) : (
                <img src="/images/loading.gif" alt="" className={styles.image} />
            )}
        </>
    );
}
