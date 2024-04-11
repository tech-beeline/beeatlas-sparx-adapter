import { NavLink, useParams } from "react-router-dom";
import React, { useEffect, useState } from 'react';
import refresh from './refresh.png'
import './css/e2e-scenario.css'
import MessageCard from "./message-card.mjs";

const IA_CAPTION_TEXT = {
    none: 'Показать профиль нагрузки',
    show: 'Скрыть профиль нагрузки'
}

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
            const show_span = document.getElementById('show-hide-application');

            if (show_span) {
                show_span.innerText = app_container.style.display === '' ? '[Скрыть]' : '[Показать]'
            }

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
        return null;
    }

    function showHideChild(e) {
        /**
         * @type {HTMLElement}
         */
        const span = e.target;
        span.classList.toggle('caret-down')

        span.parentElement.querySelectorAll('.child-messages').forEach(d => {
            d.style.display = d.style.display == 'none' ? '' : 'none';
        })
    }

    function showHideIA(e) {
        const div_caption = e.target;
        div_caption.parentElement.querySelectorAll('.ia-content').forEach(d => {
            d.style.display = d.style.display == 'none' ? '' : 'none';
            div_caption.innerText = d.style.display === 'none' ? IA_CAPTION_TEXT.none : IA_CAPTION_TEXT.show
        })
    }

    function buildMessageTree(messages) {
        messages = messages ? messages.filter(m => m.type !== 'internalCall') : [];

        if (!messages.length) return;
        return <><ul>
            {messages.map(m => {
                const has_child = m.messages?.filter(m => m.type !== 'internalCall').length;

                return <li><MessageCard message={m} applications={e2eScenario?.scenario?.applications}></MessageCard>
                    {m.duration ? <div>Длительность : {m.duration}</div> : ''}
                    {m.interfaceAgreement?.yaml?.loadProfile ? <div>
                        <div onClick={showHideIA} className="ia-caption">{IA_CAPTION_TEXT.none}</div>
                        <div className="ia-content" style={{ display: 'none' }}>
                            <div>rps : {m.interfaceAgreement?.yaml?.loadProfile.requests?.value} / {m.interfaceAgreement?.yaml?.loadProfile.requests?.dimension}
                            </div>
                            <div>Максимальная задержка (95 перцентиль) : {m.interfaceAgreement?.yaml?.loadProfile?.responseDelayMax?.value} {m.interfaceAgreement?.yaml?.loadProfile?.responseDelayMax?.dimension}</div>
                        </div>
                    </div> : ''}
                    {has_child ? <div>
                        <span className="caret" onClick={showHideChild}>Дочерние сообщения</span>
                        <div className="child-messages">
                            {buildMessageTree(m.messages)}
                        </div>
                    </div>
                        : ''}
                </li>
            })}</ul></>
    }

    return <div>
        {e2eScenario?.error ? <div><h3>Ошибка при загрузке данных<br />{e2eScenario?.error}</h3><p>{e2eScenario.errorBody}</p></div> : ''}
        {e2eScenario?.scenario ?
            <div>
                <div>
                    <h2 style={{ backgroundColor: "gray" }}>Приложения <span onClick={showHideApplication} id='show-hide-application'>[Показать]</span></h2>
                    <div id="applications-container" style={{ display: 'none' }}>
                        <div style={{ display: 'table-row-group' }}><div style={{ display: 'table-row' }}><div style={{ display: 'table-cell', fontWeight: 'bold' }}>cmdbMnemonic</div><div style={{ display: 'table-cell', fontWeight: 'bold' }}>Приложение</div></div></div>
                        <div style={{ display: 'table-row-group' }}>
                            {Object.values(e2eScenario.scenario.applications).map(v => <div style={{ display: 'table-row' }}><div style={{ display: 'table-cell' }}>{v.cmdb}</div><div style={{ display: 'table-cell' }}>{v.name}</div></div>)}
                        </div>
                    </div>
                </div>
                <div>
                    <h2 style={{ backgroundColor: "gray" }}>Business Interactions</h2>
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
    </div>
}