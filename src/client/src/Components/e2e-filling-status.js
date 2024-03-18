import { NavLink } from "react-router-dom";
import React, { useEffect, useState } from 'react';

function LoadStatusDialog() {
    const [loadStatus, setLoadStatus] = useState('Загрузка данных');
    return <dialog open>
        <p style={{ fontSize: 30 }}>{loadStatus}</p>
    </dialog>;
}

function E2EFillingStatus() {
    const [e2eStatus, setE2eStatus] = useState(null);
    const update = async () => {
        let response = await fetch('/api/process-filling');
        if (response.status !== 200) {

        }
        let data = await response.json();
        setE2eStatus(data);
    }

    useEffect(() => {
        update();
    }, [])


    return (
        e2eStatus ? <div className="E2EFillingStatus">
            <table>
                <thead>
                    <tr><th>№</th><th>Процесс</th><th>Выключены заметки</th><th>Всего компонент</th><th>Компоненты не из справочника</th><th>Всего взаимодействий</th>
                        <th>Методы не из спецификации</th><th>Без IA</th>
                    </tr>
                </thead>
                {e2eStatus.map((row, i) => <tr>
                    <td>{i + 1}</td>
                    <td><NavLink to={row.uid + '/details'}>{row.sequence}</NavLink></td>
                    <td>{row.diagrams_notes_off}</td>
                    <td>{row.total_components}</td>
                    <td>{row.components_not_from_catalog}</td>
                    <td>{row.total_interaction}</td>
                    <td>{row.operations_not_specified}</td>
                    <td>{row.operations_without_ia}</td>
                </tr>)}
            </table>
        </div> : <div><LoadStatusDialog></LoadStatusDialog></div>
    );
}

export default E2EFillingStatus;
