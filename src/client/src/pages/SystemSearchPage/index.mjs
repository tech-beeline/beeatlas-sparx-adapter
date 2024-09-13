import React, { useEffect } from "react";
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import { MainBar, SearchBox } from "../../components/index.mjs";
import styles from "./SystemSearchPage.module.css";

export function SystemSearchPage() {
    const [systems, setSystems] = React.useState(null);
    const [filter, setFilter] = React.useState("");

    const navigate = useNavigate();

    async function loadData() {
        const response = await fetch(`/api/v1/systems`);
        if (response.status !== 200) {
            setSystems({
                error: `HTTP STATUS: ${response.status} ( ${response.statusText})`,
                errorBody: await response.text(),
            });
            return;
        }

        let apps = await response.json();

        setSystems(apps);
    }

    useEffect(() => {
        loadData();
    }, []);

    return systems ? (
        systems.error ? (
            <Box component={Paper}>
                Ошибка при загрузке данных {systems.error}
            </Box>
        ) : (
            <Box>
                <MainBar
                    title="Каталог систем"
                    barContent={<SearchBox setSearchText={setFilter} />}
                />
                <TableContainer component={Paper}>
                    <Table size="small">
                        <colgroup>
                            <col className={styles.smallColumn} />
                            <col className={styles.bigColumn} />
                        </colgroup>
                        <TableHead>
                            <TableRow>
                                <TableCell>Код продукта</TableCell>
                                <TableCell>Название</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {(filter.length > 0
                                ? systems.filter(
                                      (s) =>
                                          s.code.includes(filter) ||
                                          s.name.includes(filter)
                                  )
                                : systems
                            ).map((s) => (
                                <TableRow
                                    className={styles.pointer}
                                    key={s.code}
                                    hover
                                    onClick={() => {
                                        navigate(`/systems/${s.code}`);
                                    }}
                                >
                                    <TableCell>{s.code}</TableCell>
                                    <TableCell>
                                        <a
                                            href={`/systems/${s.code}`}
                                            onClick={(e) => e.preventDefault()}
                                        >
                                            {s.name}
                                        </a>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        )
    ) : (
        <Box>Данные загружаются....</Box>
    );
}
