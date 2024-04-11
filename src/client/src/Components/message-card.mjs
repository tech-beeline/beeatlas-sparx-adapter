import SUCESS_ICON from './image/icons8-approval-50.png'

export default function MessageCard({ message, applications }) {
    console.log(message);
    const server = applications[message.server?.$ref?.split('/').at(-1)]?.name ?? message.server_name;

    const has_child = message.messages?.filter(m => m.type !== 'internalCall').length;
    const message_caption = <><span className="application">[{server}]</span> : {message.message}</>

    return <div className="message-caption">{message_caption} <span><img src={SUCESS_ICON} width="20px" /> Показать детали</span> <br></br><b>Диаграмма:</b> <a href={`https://ms-seaapp001.bee.vimpelcom.ru:83/?m=1&o=${message.diagram_uid}`}>{message.diagram}</a>
    </div>
}