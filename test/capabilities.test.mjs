process.env.NODE_ENV = 'test';

import env from '../src/env.mjs'
import request from 'supertest'
import app from '../src/load-app.mjs'

const BC_000107_RESPONSE = {
    "code": "BC-000107",
    "href": "http://127.0.0.1:3004/api/capabilities/BC-000107",
    "name": "Возможность аутентификации клиента в онлайн канале",
    "description": "Возможность аутентификации и идентификации клиента в онлайн канале\r\nВозможность Идентификации и Аутентификации Клиента в онлайн-канале для получения доступа к приобретению продуктов и услуг и обслуживанию по ним\r\nhttps://btask.beeline.ru/browse/IDP-1581?jql=project%20%3D%20%22Identity%20Platform%22%20AND%20type%20%3D%20Initiative", "parent": { "code": "BC-011234", "href": "http://127.0.0.1:3004/api/capabilities/BC-011234" }, "domain": { "code": "DMN.002", "href": "http://127.0.0.1:3004/api/domains/DMN.002" }, "owner": {}
}

const BC_000107_CHILDREN_RESPONSE = [
    {
        code: 'BC-006240',
        href: 'http://127.0.0.1:3004/api/capabilities/BC-006240',
        name: 'Возможность логирования событий аутентификации ',
        description: 'Возможность ослеживания бизнес событий процесса аутентификации \r\n' +
            'https://btask.beeline.ru/browse/IDP-1572\r\n' +
            '\r\n' +
            'НФТ доступны по ссылке https://bwiki.beeline.ru/pages/viewpage.action?pageId=265195860\r\n' +
            'https://btask.beeline.ru/browse/IDP-2157\r\n' +
            'https://btask.beeline.ru/browse/IDP-1891\r\n' +
            '\r\n' +
            'Функциональные требования описаны в HLD, которая доступна по ссылке: https://bwiki.beeline.ru/pages/viewpage.action?pageId=316483244\r\n',
        parent: {
            code: 'BC-000107',
            href: 'http://127.0.0.1:3004/api/capabilities/BC-000107'
        },
        domain: {
            code: 'DMN.002',
            href: 'http://127.0.0.1:3004/api/domains/DMN.002'
        },
        owner: {}
    },
    {
        code: 'BC-006223',
        href: 'http://127.0.0.1:3004/api/capabilities/BC-006223',
        name: 'Возможность обмена  токенами аутентификации',
        description: 'Возможность обмена токенами аутентификации\r\n' +
            'https://btask.beeline.ru/browse/IDP-1575\r\n' +
            '\r\n' +
            'НФТ доступны по ссылке https://bwiki.beeline.ru/pages/viewpage.action?pageId=265195860\r\n' +
            'https://btask.beeline.ru/browse/IDP-2157\r\n' +
            'https://btask.beeline.ru/browse/IDP-1891\r\n' +
            '\r\n' +
            'Функциональные требования описаны в HLD, которая доступна по ссылке: https://bwiki.beeline.ru/pages/viewpage.action?pageId=325382266\r\n',
        parent: {
            code: 'BC-000107',
            href: 'http://127.0.0.1:3004/api/capabilities/BC-000107'
        },
        domain: {
            code: 'DMN.002',
            href: 'http://127.0.0.1:3004/api/domains/DMN.002'
        },
        owner: {}
    },
    {
        code: 'BC-011223',
        href: 'http://127.0.0.1:3004/api/capabilities/BC-011223',
        name: 'Возможность аутентификации с помощью Одноразового пароля',
        description: 'Возможность аутентификации и идентификации клиента в онлайн канале\r\n' +
            'Возможность Идентификации и Аутентификации Клиента в онлайн-канале для получения доступа к приобретению продуктов и услуг и обслуживанию по ним\r\n' +
            'https://btask.beeline.ru/browse/IDP-1581?jql=project%20%3D%20%22Identity%20Platform%22%20AND%20type%20%3D%20Initiative',
        parent: {
            code: 'BC-000107',
            href: 'http://127.0.0.1:3004/api/capabilities/BC-000107'
        },
        domain: {
            code: 'DMN.002',
            href: 'http://127.0.0.1:3004/api/domains/DMN.002'
        },
        owner: {}
    }
];

const BC_000107_REALIZATION_RESPONSE = [
    {
        code: '{F8F0BE6B-7FFF-481d-A8F0-1BE6BA23AD5F}',
        name: 'Промежуточная',
        interfaces: [
            {
                "code": "RICH",
                "name": "RICH",
                "type": "Component"
            }
        ]
    },
    {
        code: '{9961438B-B1BA-4ea1-820B-28FB3A5B775D}',
        name: 'Legacy',
        interfaces: [{
            "code": "USSS",
            "name": "Unified Self Service System (USSS)",
            "type": "Component"
        }]
    }
];

describe('/api/capabilities', () => {
    it("/api/capabilities/:code", function (done) {
        request(app)
            .get('/api/capabilities/BC-000107')
            .expect(200)
            .expect('Content-Type', /application\/json/)
            .expect(BC_000107_RESPONSE)
            .end(done);
    });


    it("/api/capabilities/:code/children", function (done) {
        request(app)
            .get('/api/capabilities/BC-000107/children')
            .expect(200)
            .expect('Content-Type', /application\/json/)
            .expect(BC_000107_CHILDREN_RESPONSE)
            .end(done);
    });
    ///api/capabilities/BC-014540/realizations
    it("/api/capabilities/:code/realization", function (done) {
        request(app)
            .get('/api/capabilities/BC-014540/realizations')
            .expect(200)
            .expect('Content-Type', /application\/json/)
            .expect(BC_000107_REALIZATION_RESPONSE)
            .end(done);
    });
})