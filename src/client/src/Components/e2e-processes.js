import { NavLink } from "react-router-dom";
import React, { useEffect, useState } from 'react';
import './css/table.css'


function E2EProcesses() {
    const [e2eProcess, setE2eProcess] = useState(null);

    const update = async () => {
        let response = await fetch('api/v1/e2e-processes');
        if (response.status !== 200) {
            let body = await response.text();
            setE2eProcess(`Ошибка при загрузке данных ${response.status} ${body}`)
            return;
        }
        let data = await response.json();
        setE2eProcess(data);
    }

    useEffect(() => {
        update();
    }, [])

    return e2eProcess ? (typeof (e2eProcess) === "String" ? <div>{e2eProcess}</div> :
        <div>
            <ul>
                {e2eProcess.map(g => <li>{g.name}
                    <ul>
                        {g.base_processes?.map(b => <li>
                            {b.name}
                            <ul>
                                {b.key_processes?.map(k => <li>
                                    {k.name}
                                    <ul>
                                        {k.scenarios?.map(s => <li>
                                            <a target="_blank" href={`/e2e-scenarios/${encodeURIComponent(s.uid)}`}>{k.name}</a>
                                        </li>)}
                                    </ul>
                                </li>)}
                            </ul>
                        </li>)}
                    </ul>
                </li>)}
            </ul>
        </div>
    ) : <div>Загрузка данных</div>
}

export default E2EProcesses;
