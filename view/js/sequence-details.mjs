function td(data, attr) {
    return e('td', null, data);
}
function tr(data, attr) {
    if (Array.isArray(data)) {
        return e('tr', null, data.map(c => td(c)));
    }
}

function a(title, url, attr) {
    return e('a', Object.assign({ href: url }, attr), title)
}

function e(name, attr, content) {
    /**
     * @type {HTMLElement}
     */
    let ret = document.createElement(name);
    if (typeof content === "string") {
        ret.append(content);
    }
    if (Array.isArray(content)) {
        ret.append(...content);
    }
    if (content instanceof HTMLElement) {
        ret.appendChild(content);
    }

    if (attr) {
        for (const aname in attr) {
            ret.setAttribute(aname, attr[aname]);
        }
    }
    return ret;
}

function iaTag(ia) {
    return ia ? a(ia, ia.startsWith('https://') ? ia : `https://git.vimpelcom.ru/common/architecture/interface-agreement/-/blob/main${ia}`, { target: "_blank" }) : "";
}

/**
 * 
 * @param {HTMLElement} body 
 */
async function loadMessages(body) {
    try {
        const response = await fetch("/api/messages/?validate");
        if (response.status !== 200) {
            throw Error(`Ошибка при загрузке данных: HTTP ${response.status} ${await response.text()}`)
        }
        
        let messages = await response.json();
        body.innerHTML = "";
        body.append(...messages.map(m => tr([
            a(m.process, 'ya.ru', { target: '_blank' }),
            m.comments,
            m.consumer, m.consumer_code, m.operation, m.supplier, m.supplier_code,
            iaTag(m.ia)
            , m.author, m.modifieddate
        ])));
        
    } catch (e) {
        body.querySelectorAll('td').forEach(td => { td.textContent = e.toString() })
    }
}

let data_body = document.getElementById('data-table-body');
if (data_body) {
    loadMessages(data_body);
}