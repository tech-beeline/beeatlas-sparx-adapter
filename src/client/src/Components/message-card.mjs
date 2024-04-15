

const DETAILS_BUTTON_CAPTION = {
    none: 'Показать детали',
    show: 'Скрыть детали'
}

function SuccessIcon() {
    return <img src='/images/success.png' width="20px"></img>
}

function ErrorIcon() {
    return <img src='/images/error.png' width="20px"></img>
}

const StatusIcon = ({ errors }) => errors.length ? ErrorIcon() : SuccessIcon();

function MessageErrors({ errors }) {
    return errors.length ? <div style={{ color: 'red' }}><b>Ошибки в описании:</b>
        <ul>
            {errors.map(e => <li><div dangerouslySetInnerHTML={{ __html: e }}></div></li>)}
        </ul>
    </div> : '';
}

function LoadProfile({ interfaceAgreement } = {}) {
    if (interfaceAgreement?.yaml?.loadProfile) {
        return <div>
            <div><b>rps :</b> {interfaceAgreement.yaml.loadProfile.requests?.value} / {interfaceAgreement.yaml.loadProfile.requests?.dimension}
            </div>
            <div><b>Максимальная задержка (95 перцентиль)</b>: {interfaceAgreement.yaml.loadProfile.responseDelayMax?.value} {interfaceAgreement.yaml.loadProfile.responseDelayMax?.dimension}</div>
        </div>
    }
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

function ChildMessages({ message, applications = {}, context = [message] } = {}) {
    const children = message.messages?.filter(m => m.type !== 'internalCall') ?? [];
    if (children.length) return <div>
        <div>
            <span className="caret caret-down" onClick={showHideChild}>Дочерние сообщения</span>
            <div className="child-messages" style={{ display: 'none' }}>
                <ul>
                    {children.map(m => <MessageCard message={m} applications={applications} context={[...context, message]} />)}
                </ul>
            </div>
        </div>
    </div >;
}

export default function MessageCard({ message, applications, context = [] }) {
    function showHideDetails(e) {
        /** @type {HTMLElement} */
        const sp = e.target;
        Array.from(sp.parentElement.children)
            .filter(d => d.classList.contains('details-block'))
            .forEach(d => {
                d.style.display = d.style.display == 'none' ? '' : 'none';
                sp.innerText = d.style.display === 'none' ? DETAILS_BUTTON_CAPTION.none : DETAILS_BUTTON_CAPTION.show
            });
    }
    /**@type {Array} */
    let errors = [...message.validationError] ?? [];
    const server = applications[message.server?.$ref?.split('/').at(-1)];
    if (!server) {
        errors.push(`Нет связи с системой в CMDB`)
    }
    const server_name = server?.name ?? message.server_name;
    let interfaceAgreement = message.interfaceAgreement;
    if (!interfaceAgreement) {
        errors.push('Нет ссылки на интерфейсное соглашение');
    }
    if (interfaceAgreement && !interfaceAgreement.yaml) {
        errors.push('Не получилось разобрать содержимое интерфейсного соглашения');
    }

    if (interfaceAgreement && interfaceAgreement.yaml && !interfaceAgreement.yaml.loadProfile) {
        errors.push('В интерфейсном соглашении отсутствует профиль нагрузки');
    }

    function TreeIcon() {
        if (has_child) return <img src='/images/tree.png' width="20px"></img>
    }

    const has_child = message.messages?.filter(m => m.type !== 'internalCall').length;
    const message_caption = <><span className="application">[{server_name}]</span> : {message.message}</>

    return <div className="message-caption"><TreeIcon></TreeIcon> <StatusIcon errors={errors} />{message_caption} <span className="message-details-button" onClick={showHideDetails}>{DETAILS_BUTTON_CAPTION.none}</span> <br></br>
        <div className='details-block' style={{ display: 'none' }} >
            <b>Диаграмма:</b> <a href={`https://ms-seaapp001.bee.vimpelcom.ru:83/?m=1&o=${message.diagram_uid}`} target='_blank'>{message.diagram}</a>
            <LoadProfile interfaceAgreement={interfaceAgreement} />
            <div>Цепочка вызовов: {[...context, message].map(m => `[${m.message}]`).join('->')}</div>
            <MessageErrors errors={errors}></MessageErrors>
            <ChildMessages message={message} context={context} applications={applications}></ChildMessages>
        </div>
    </div>
}