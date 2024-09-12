import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import React, { useEffect, useRef } from "react";
import { MainBar } from "../../../Menu/main-bar.mjs";
import { SearchBox } from "../../../Menu/search.mjs";

function SearchFilter({ systems, setFilter, filter }) {
    const valueRef = useRef("");
    return (
        <Box component={Paper}>
            <TextField
                label="Фильтр"
                variant="standard"
                defaultValue={filter}
                inputRef={valueRef}
                onChange={() => setFilter?.(valueRef.current.value)}
            />
        </Box>
    );
}

export default function SearchSystemPage() {
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
                            <col style={{ width: "5%" }} />
                            <col style={{ width: "30%" }} />
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
                                    sx={{ cursor: "pointer" }}
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
