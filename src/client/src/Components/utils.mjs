export function webEALink(uid) {
    return `https://ms-seaapp001.bee.vimpelcom.ru:83/?m=1&o=${uid}`
}

export function WebEANaviLine({ uid }) {
    return <a href={webEALink(uid)} target="_blank">Посмотреть в WebEA</a>
}