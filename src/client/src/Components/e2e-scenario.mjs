import { NavLink, useParams } from "react-router-dom";
import React, { useEffect, useState } from 'react';



export default function E2EScenario() {
    const [e2eScenario, setE2EScenario] = useState(null);
    const [validationError, setValidationError] = useState(null);


    const { uid } = useParams();

    const loadScenario = async () => {
        const response = await fetch(`/api/v1/e2e-process-messages/${encodeURIComponent(uid)}`)
        if (response.status !== 200) {
            setE2EScenario({ error: `HTTP STATUS: ${response.status} ( ${response.statusText})`, errorBody: await response.text() })
            return;
        }
        setE2EScenario({ scenario: await response.json() })
    }

    useEffect(() => {
        loadScenario();
    }, [])

    function showHideApplication() {
        const app_container = document.getElementById('applications-container')
        if (app_container) {
            app_container.style.display = app_container.style.display === 'none' ? '' : 'none'
        }
        console.log('show/hide')
    }

    /**
     * 
     * @param {String} ref 
     */
    function getApp(ref) {
        if (ref && ref.startsWith('#') && e2eScenario?.scenario) {
            return ref.split('/').slice(1).reduce((acc, v) => acc ? acc[v] ?? null : null, e2eScenario.scenario);
        }
        return { cmdb: "", name: '' }
    }
    function buildMessageTree(messages, level = 0) {
        return messages ? <ul>{messages.filter(m => m.type !== 'internalCall').map(m =>
            <li>[{getApp(m.client?.$ref)?.name ?? ''}]-&gt;[{getApp(m.server?.$ref)?.name ?? ''}] : {m.message} <font color='green'>{m.diagram}</font> {
                m.validationError?.length ? <div style={{ color: 'red' }}><b>Ошибки в описании:</b>
                <ul>
                {m.validationError.map( err=><li>{err}</li>)}
                </ul>
                </div> : ''}
                
                <div>
                    {buildMessageTree(m.messages, level + 1)}
                </div>
            </li>)}</ul> : ''
    }

    function showValidationError(message) {
        setValidationError(message.validationError);
        document.getElementById('validation-error')?.showModal();
    }
    return <div>
        {e2eScenario?.error ? <div><h3>Ошибка при загрузке данных<br />{e2eScenario?.error}</h3><p>{e2eScenario.errorBody}</p></div> : ''}
        {e2eScenario?.scenario ?
            <div>
                <div>
                    <h2 onClick={showHideApplication} style={{ backgroundColor: "gray", cursor: "pointer" }}>Приложения</h2>
                    <div id="applications-container" style={{ display: 'table' }}>
                        <div style={{ display: 'table-row-group' }}><div style={{ display: 'table-row' }}><div style={{ display: 'table-cell', fontWeight: 'bold' }}>cmdbMnemonic</div><div style={{ display: 'table-cell', fontWeight: 'bold' }}>Приложение</div></div></div>
                        <div style={{ display: 'table-row-group' }}>
                            {Object.values(e2eScenario.scenario.applications).map(v => <div style={{ display: 'table-row' }}><div style={{ display: 'table-cell' }}>{v.cmdb}</div><div style={{ display: 'table-cell' }}>{v.name}</div></div>)}
                        </div>
                    </div>
                </div>
                <div>
                    <h2 style={{ backgroundColor: "gray", cursor: "pointer" }}>Business Interactions</h2>
                    <div>
                        {(e2eScenario.scenario.businessInteractions ?? []).map(bi => <div>
                            <h4>{bi.name}</h4>
                            <div>
                                {buildMessageTree(bi.scenario)}
                            </div>
                        </div>)}
                    </div>
                </div>
            </div>
            : 'Идет загрузка данных'}
        {validationError ?
            <dialog open id="validation-error" style={{
                position: 'absolute',
                float: "left",
                background: 'green',
                left: '50%',
                top: '50%',
                transform: "translate(-50%, -50%)"
            }}><div>
                    {validationError.join(', ')}
                </div><div>
                    <button onClick={()=>{ document.getElementById('validation-error')?.close()}}>Close</button></div>
            </dialog>
            : ''}
    </div>
}