import { NavLink, useParams } from "react-router-dom";
import React, { useEffect, useState } from 'react';



function E2EFillingDetails(props) {

    const [e2eStatus, setE2eStatus] = useState([]);

    const { code } = useParams();
    const loadNoteStatus = async () => {
        const response = await fetch(`/api/process-filling/${encodeURIComponent(code)}/details`);
        setE2eStatus(await response.json())
    }

    useEffect(() => {
        loadNoteStatus();
    }, [])

    return (
        <div className="E2EFillingDetails">
            <table>
                <caption><b>Выключенные заметки на диаграммах</b></caption>
                <thead><tr><th>Диаграмма</th><th>Статуус заметок на диаграмме</th></tr></thead>
                <tbody>
                    {e2eStatus.map(row => <tr>
                        <td>{row.diagram}</td><td>{row.note_off?<b><font color="red">Выключены</font></b>:<b color="green"><font color="green">Включены</font></b>}</td></tr>)}
                </tbody>
            </table>
        </div>
    );
}

export default E2EFillingDetails;
