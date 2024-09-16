import React, { useEffect, useState } from "react";

import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Box,
} from "@mui/material";

export function E2EDashboardMainPage() {
    const [e2eProcessList, setE2eProcessList] = useState(null);

    const loadProcessList = async () => {
        let response = await fetch("/api/v1/e2e-processes");
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

    const scenarioData = (scenarios) =>
        scenarios
            ? scenarios.map((s) => (
                  <TableCell>
                      <a
                          target="_blank"
                          rel="noreferrer"
                          href={`/e2e/processes/${encodeURIComponent(s.uid)}`}
                      >
                          {s.name}
                      </a>
                  </TableCell>
              ))
            : (console.log(scenarios), []);
    /** @param {Array} processes*/
    const processData = (processes) =>
        processes.reduce((acc, p) => {
            return [
                ...acc,
                ...scenarioData(p.scenarios).map((v, i) =>
                    i
                        ? [v]
                        : [
                              <TableCell rowSpan={p.scenarios.length}>
                                  {p.name}
                              </TableCell>,
                              v,
                          ]
                ),
            ];
        }, []);
    const baseData = (processes) =>
        processes.reduce((acc, p) => {
            return [
                ...acc,
                ...processData(p.key_processes).map((v, i, a) =>
                    i
                        ? [v]
                        : [
                              <TableCell rowSpan={a.length}>
                                  {p.name}
                              </TableCell>,
                              v,
                          ]
                ),
            ];
        }, []);

    const groupData = (groups) =>
        groups.reduce(
            (acc, p) => [
                ...acc,
                ...baseData(p.base_processes).map((v, i, a) =>
                    i
                        ? [v]
                        : [
                              <TableCell rowSpan={a.length}>
                                  {p.name}
                              </TableCell>,
                              v,
                          ]
                ),
            ],
            []
        );

    return e2eProcessList ? (
        e2eProcessList.error ? (
            <Box component={Paper}>
                Ошибка при получении данных: {e2eProcessList.error}
            </Box>
        ) : (
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Группа процессов</TableCell>
                            <TableCell>Базовый процесс</TableCell>
                            <TableCell>Процесс</TableCell>
                            <TableCell>Е2Е Сценарий</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {groupData(e2eProcessList).map((r) => (
                            <TableRow>{r}</TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        )
    ) : (
        <img
            src="/images/loading.gif"
            alt=""
            style={{
                display: "block",
                marginLeft: "auto",
                marginRight: "auto",
            }}
        />
    );
}
