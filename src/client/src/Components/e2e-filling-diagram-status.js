import { NavLink, useParams } from "react-router-dom";
import React, { useEffect, useState } from 'react';
import './css/table.css'


function E2EFillingDiagramStatus() {
    const [components, setComponents] = useState(null);
    const [messages, setMessages] = useState(null);
    const [diagramInfo, setDiagramInfo] = useState(null);

    const [componentsLoadStatus, setComponentsLoadStatus] = useState('Загрузка данных о компонентах');
    const [messagesLoadStatus, setMessagesLoadStatus] = useState('Загрузка данных о вызовах');
    const [loadDiagramStatus, setLoadDiagramStatus] = useState('Загрузка данных о диаграмме');

    const { sequence, diagram } = useParams();

    const updateComponents = async () => {
        let res = await fetch(`/api/process-component-status/${diagram}`)
        if (res.status != 200) {
            const text = await res.text()
            setComponentsLoadStatus(`Ошибка при загруке компонентов ${res.status} ${text}`)
            return;
        }
        setComponents(await res.json());
    }

    const updateMessages = async () => {
        let res = await fetch(`/api/process-messages-status/${diagram}`)
        if (res.status != 200) {
            const text = await res.text()
            setMessagesLoadStatus(`Ошибка при загруке компонентов ${res.status} ${text}`)
            return;
        }
        setMessages(await res.json());
    }
    const updateDiagramInfo = async () => {
        let res = await fetch(`/api/diagram/${diagram}`)
        if (res.status != 200) {
            const text = await res.text()
            setLoadDiagramStatus(`Ошибка при загруке компонентов ${res.status} ${text}`)
            return;
        }
        setDiagramInfo(await res.json());
    }

    useEffect(() => {
        updateDiagramInfo();
        updateComponents();
        updateMessages();
    }, [])

    /**
     * 
     * @param {String} s 
     */
    function getLatency(s) {
        return s ? (s.split(';').find(r => r.startsWith('DCBM=')) ?? '').substring(5) : '';
    }

    return (
        <div className="E2EFillingDiagramStatus">
            <div>
                <NavLink to={`/e2e-filling-status/${sequence}/details`}>Вернуться к Е2Е процессу</NavLink>
                {diagramInfo ? <div><h3>Диаграмма: {<NavLink to={`https://ms-seaapp001.bee.vimpelcom.ru:83?m=1&o=${diagramInfo.ea_guid}`} target="_blank">{diagramInfo.name}</NavLink>}</h3><p>{diagramInfo.description ?? ""}</p> </div> : <div><p>Заграка инфомрации о диаграмме</p></div>}
            </div>
            {components ? <div>
                <table>
                    <caption><h4>Статус по компонентам</h4></caption>
                    <thead>
                        <tr><th>Компонент</th><th>CMDB мнемоника</th><th>Тип объекта на диаграмме</th><th>Связь с каталогом</th></tr>
                    </thead>
                    <tbody>
                        {components.map(row => <tr className="hl-row">
                            <td><a href={`https://ms-seaapp001.bee.vimpelcom.ru:83?m=1&o=${row.ea_guid}`} target="_blank">{row.name}</a></td>
                            <td>{row.cmdb}</td>
                            <td>{row.object_type}</td>
                            <td>{row.cmdb ? <font color="green"><b>Есть в каталоге</b></font> : <font color="red"><b>Отсутвует в каталоге</b></font>}</td>
                        </tr>)}
                    </tbody>
                </table>
            </div> : <div>
                <p style={{ fontSize: 30 }}>{componentsLoadStatus}</p>
            </div>}
            {messages ? <div>
                <table>
                    <caption><h4>Статус по вызовам на диаграмме (только для компонентов из каталога приложений)</h4></caption>
                    <thead>
                        <tr><th>№ </th> <th>Вызывающий компонент</th><th>Вызов</th><th>Вызываемый компонент</th><th>Метод из интерфейса</th><th>Ссылка на IA</th><th>Длительность</th></tr>
                    </thead>
                    <tbody>
                        {messages.map((row,i) => <tr className="hl-row">
                            <td>{i+1}</td>
                            <td>{row.client}</td>
                            <td>{row.message}</td>
                            <td>{row.server}</td>
                            {row.operation_guid ? <td style={{ color: 'green' }}>Да</td> : <td style={{ color: 'red', fontWeight: 'bold' }}>Нет</td>}
                            {row.ia_path ?
                                <td style={{ color: 'green' }}>{row.ia_path} </td> :
                                <td style={{ color: 'red', fontWeight: 'bold' }}>Отсутствует</td>}
                            <td>{getLatency(row.styleex)}</td>
                        </tr>)}
                    </tbody>
                </table>
            </div> : <div>
                <p style={{ fontSize: 30 }}>{messagesLoadStatus}</p>
            </div>}
        </div>
    );
}

export default E2EFillingDiagramStatus;
