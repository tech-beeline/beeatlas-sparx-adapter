import { NavLink, useParams } from "react-router-dom";
import React, { useEffect, useState } from 'react';



function E2EFillingDiagramStatus() {
    const [components, setComponents] = useState(null);
    const { sequence, diagram } = useParams();
    const updateComponents = async () => {
        let res = await fetch(`/api/process-component-status/${diagram}`)
        if (res.status == 200) {
            setComponents(await res.json());
        }
    }

    useEffect(() => {
        updateComponents();
    }, [])


    return (
        <div className="E2EFillingDiagramStatus">
            <div>
                <NavLink to={`/e2e-filling-status/${sequence}/details`}>Вернуться к Е2Е процессу</NavLink>
            </div>
            {components ? <div>
                <table>
                    <caption>Статус по компонентам</caption>
                    <thead>
                        <tr><th>Компонент</th><th>CMDB мнемоника</th><th>Тип объекта на диаграмме</th><th>Связь с каталогом</th></tr>
                    </thead>
                    <tbody>
                        {components.map(row => <tr>
                            <td><a href={`https://ms-seaapp001.bee.vimpelcom.ru:83?m=1&o=${row.ea_guid}`} target="_blank">{row.name}</a></td>
                            <td>{row.cmdb}</td>
                            <td>{row.object_type}</td>
                            <td>{row.cmdb?<font color="green"><b>Есть в каталоге</b></font>:<font color="red"><b>Отсутвует в каталоге</b></font>}</td>
                        </tr>)}
                    </tbody>
                </table>
            </div> : `Загрузка данных о компонентах`}
        </div>
    );
}

export default E2EFillingDiagramStatus;
