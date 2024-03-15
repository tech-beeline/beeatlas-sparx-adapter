import { NavLink, useParams } from "react-router-dom";
import React, { useEffect, useState } from 'react';



function E2EFillingDetails(props) {

    const [e2eStatus, setE2eStatus] = useState();

    const { code } = useParams();
    const loadNoteStatus = async () => {
        const response = await fetch(`/api/process-filling/${encodeURIComponent(code)}/details`);
        setE2eStatus(await response.json())
    }

    useEffect(() => {
        loadNoteStatus();
    }, [])

    return (
        e2eStatus ?
            <div className="E2EFillingDetails">
                <NavLink to={`/e2e-filling-status`}>К списку Е2Е процессов</NavLink>

                <table>
                    <thead>
                        <tr><th>№</th><th>Процесс</th><th>Выключены заметки</th><th>Всего компонент</th><th>Компоненты не из справочника</th><th>Всего взаимодействий</th>
                            <th>Методы не из спецификации</th><th>Без IA</th>
                        </tr>
                    </thead>
                    {e2eStatus.map((row, i) => <tr>
                        <td>{i + 1}</td>
                        <td><NavLink to={row.uid}>{row.sequence}</NavLink></td>
                        <td>{row.diagrams_notes_off ? <font color="red"><b>Выключены</b></font> : <font color="green">Включены</font>}</td>
                        <td>{row.total_components}</td>
                        <td>{row.components_not_from_catalog > 0 ? <b style={{ color: 'red' }}>{row.components_not_from_catalog}</b> : 0}</td>
                        <td>{row.total_interaction}</td>
                        <td>{row.operations_not_specified}</td>
                        <td>{row.operations_without_ia}</td>
                    </tr>)}
                </table>
            </div> : <div><dialog open>
                <p style={{ fontSize: 30 }}>Загрузка данных</p>
            </dialog></div>
    );
}

export default E2EFillingDetails;
