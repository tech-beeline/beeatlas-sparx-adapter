import SUCESS_ICON from './image/icons8-approval-50.png'
import ERROR_ICON from './image/error.png'


const DETAILS_BUTTON_CAPTION = {
    none: 'Показать детали',
    show: 'Скрыть детали'
}

function MessageErrors({ errors }) {
    console.log(errors)
    return errors.length ? <div style={{color:'red'}}><b>Ошибки в описании:</b>
        <ul>
            {errors.map(e => <li><div  dangerouslySetInnerHTML={{ __html: e }}></div></li>)}
        </ul>
    </div> : '';
}

export default function MessageCard({ message, applications }) {
    function showHideDetails(e) {
        const sp = e.target;
        sp.parentElement.querySelectorAll('.details-block').forEach(d => {
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
    if( interfaceAgreement && !interfaceAgreement.yaml){
        errors.push('Не получилось разобрать содержимое интерфейсного соглашения');
    }
    
    if(  interfaceAgreement && interfaceAgreement.yaml && !interfaceAgreement.yaml.loadProfile){
        errors.push('В интерфейсном соглашении отсутствует профиль нагрузки');
    }
    
    const has_child = message.messages?.filter(m => m.type !== 'internalCall').length;
    const message_caption = <><span className="application">[{server_name}]</span> : {message.message}</>

    return <div className="message-caption">{message_caption} <img src={errors.length ? ERROR_ICON : SUCESS_ICON} width="20px" /><span className="message-details-button" onClick={showHideDetails}>{DETAILS_BUTTON_CAPTION.none}</span> <br></br>
        <div className='details-block' style={{ display: 'none' }}>
            <b>Диаграмма:</b> <a href={`https://ms-seaapp001.bee.vimpelcom.ru:83/?m=1&o=${message.diagram_uid}`} target='_blank'>{message.diagram}</a>
            <MessageErrors errors={errors}></MessageErrors>
        </div>
    </div>
}