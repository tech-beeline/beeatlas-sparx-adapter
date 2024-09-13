import React, { useEffect, useState } from "react";

export function E2EProcessesPage() {
    const [e2eProcess, setE2eProcess] = useState(null);

    const update = async () => {
        let response = await fetch("api/v1/e2e-processes");
        if (response.status !== 200) {
            let body = await response.text();
            setE2eProcess(
                `Ошибка при загрузке данных ${response.status} ${body}`
            );
            return;
        }
        let data = await response.json();
        setE2eProcess(data);
    };

    useEffect(() => {
        update();
    }, []);

    /**
     *
     * @param {Array} scenarios
     */
    const scenarioData = (scenarios) =>
        scenarios
            ? scenarios.map((s) => (
                  <td>
                      <a
                          target="_blank"
                          rel="noreferrer"
                          href={`/e2e-scenarios/${encodeURIComponent(s.uid)}`}
                      >
                          {s.name}
                      </a>
                  </td>
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
                        : [<td rowSpan={p.scenarios.length}>{p.name}</td>, v]
                ),
            ];
        }, []);
    const baseData = (processes) =>
        processes.reduce((acc, p) => {
            return [
                ...acc,
                ...processData(p.key_processes).map((v, i, a) =>
                    i ? [v] : [<td rowSpan={a.length}>{p.name}</td>, v]
                ),
            ];
        }, []);
    const groupData = (groups) =>
        groups.reduce(
            (acc, p) => [
                ...acc,
                ...baseData(p.base_processes).map((v, i, a) =>
                    i ? [v] : [<td rowSpan={a.length}>{p.name}</td>, v]
                ),
            ],
            []
        );

    return e2eProcess ? (
        typeof e2eProcess === "string" ? (
            <div>{e2eProcess}</div>
        ) : (
            <div>
                <table>
                    <caption
                        style={{
                            fontSize: 20,
                            fontWeight: "bold",
                            color: "Green",
                        }}
                    >
                        Сквозные Е2Е сценарии
                    </caption>
                    <thead>
                        <tr>
                            <th>Группа</th>
                            <th>Базовый процесс</th>
                            <th>Процесс</th>
                            <th>Е2Е Сценарий</th>
                        </tr>
                    </thead>
                    <tbody>
                        {groupData(e2eProcess).map((r) => (
                            <tr>{r}</tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )
    ) : (
        <div>Загрузка данных</div>
    );
}
