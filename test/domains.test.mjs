process.env.NODE_ENV = 'test';

import env from '../src/env.mjs'
import request from 'supertest'
import app from '../src/load-app.mjs'

//#region тестовые данные
const SUBDOMAINS_RESULT = [
    {
        code: 'GRP.016',
        href: 'http://127.0.0.1:3004/api/domains/GRP.016',
        name: 'Управление Активами',
        description: null,
        createdDate: '2021-04-15T21:00:00.000Z',
        modifiedDate: '2023-05-15T14:36:29.000Z',
        author: 'vkit',
        status: 'Proposed',
        parent: {
            code: 'GRP.009',
            href: 'http://127.0.0.1:3004/api/domains/GRP.009'
        }
    },
    {
        code: 'GRP.014',
        href: 'http://127.0.0.1:3004/api/domains/GRP.014',
        name: 'Административные сервисы',
        description: null,
        createdDate: '2021-04-15T21:00:00.000Z',
        modifiedDate: '2023-05-15T14:36:15.000Z',
        author: 'vkit',
        status: 'Proposed',
        parent: {
            code: 'GRP.009',
            href: 'http://127.0.0.1:3004/api/domains/GRP.009'
        }
    },
    {
        code: 'GRP.018',
        href: 'http://127.0.0.1:3004/api/domains/GRP.018',
        name: 'Управление цепочками поставок',
        description: null,
        createdDate: '2021-04-15T21:00:00.000Z',
        modifiedDate: '2023-05-15T14:37:10.000Z',
        author: 'vkit',
        status: 'Proposed',
        parent: {
            code: 'GRP.009',
            href: 'http://127.0.0.1:3004/api/domains/GRP.009'
        }
    },
    {
        code: 'GRP.019',
        href: 'http://127.0.0.1:3004/api/domains/GRP.019',
        name: 'Управление Персоналом',
        description: null,
        createdDate: '2023-05-15T10:02:22.000Z',
        modifiedDate: '2023-05-15T14:37:44.000Z',
        author: 'Александр Кашкаров',
        status: 'Proposed',
        parent: {
            code: 'GRP.009',
            href: 'http://127.0.0.1:3004/api/domains/GRP.009'
        }
    },
    {
        code: 'GRP.017',
        href: 'http://127.0.0.1:3004/api/domains/GRP.017',
        name: 'Управление финансами',
        description: null,
        createdDate: '2021-10-22T12:51:21.000Z',
        modifiedDate: '2023-05-15T14:36:58.000Z',
        author: 'Александр Кашкаров',
        status: 'Proposed',
        parent: {
            code: 'GRP.009',
            href: 'http://127.0.0.1:3004/api/domains/GRP.009'
        }
    }
];

const DOMAIN_CAPABILITIES = [
    {
        code: 'BC-014806',
        href: 'http://127.0.0.1:3004/api/capabilities/BC-014806',
        name: 'Получение информации о выделенных Клиенту ресурсах',
        description: null,
        author: 'Александр Кашкаров',
        status: 'Proposed',
        parent: {},
        domain: {
            code: 'DMN.042',
            href: 'http://127.0.0.1:3004/api/domains/DMN.042'
        },
        owner: {}
    },
    {
        code: 'BC-014802',
        href: 'http://127.0.0.1:3004/api/capabilities/BC-014802',
        name: 'Управление клиентским ресурсным инвентарем',
        description: null,
        author: 'Александр Кашкаров',
        status: 'Proposed',
        parent: {},
        domain: {
            code: 'DMN.042',
            href: 'http://127.0.0.1:3004/api/domains/DMN.042'
        },
        owner: {}
    },
    {
        code: 'BC-014805',
        href: 'http://127.0.0.1:3004/api/capabilities/BC-014805',
        name: 'Учет клиентского оборудования',
        description: null,
        author: 'Александр Кашкаров',
        status: 'Proposed',
        parent: {},
        domain: {
            code: 'DMN.042',
            href: 'http://127.0.0.1:3004/api/domains/DMN.042'
        },
        owner: {}
    },
    {
        code: 'BC-014804',
        href: 'http://127.0.0.1:3004/api/capabilities/BC-014804',
        name: 'Изменение, замена ресурсов',
        description: null,
        author: 'Александр Кашкаров',
        status: 'Proposed',
        parent: {},
        domain: {
            code: 'DMN.042',
            href: 'http://127.0.0.1:3004/api/domains/DMN.042'
        },
        owner: {}
    }
];


const CREATE_ROOT_DOMAIN_BODY = {
    "code": "TEST.001",
    "name": "Управление клиентской инфорацией",
    "description": "string",
    "status": "Тестовый",
    "author": "OSLC-API",
}

//#endregion

describe("/api/domains", () => {
    before(() => {
        //env.config();
        //app.listen( 3005)
    })

    it("GET /api/domains", function (done) {
        request(app)
            .get('/api/domains')
            .expect(200)
            .expect('Content-Type', /application\/json/)
            //.expect("Hello, World!")
            .end(done);
    });

    it("GET /api/domains/{code}", function (done) {
        request(app)
            .get('/api/domains/GRP.010')
            .expect(200)
            .expect('Content-Type', /application\/json/)
            .expect({
                "code": "GRP.010",
                "href": `http://127.0.0.1:${process.env.API_PORT}/api/domains/GRP.010`,
                "name": "Управление ИТ",
                "description": null,
                "createdDate": "2021-04-15T21:00:00.000Z",
                "modifiedDate": "2022-10-17T11:52:03.000Z",
                "author": "vkit",
                "status": "Proposed",
                "parent": {
                    "code": "GRP.000",
                    "href": `http://127.0.0.1:${process.env.API_PORT}/api/domains/GRP.000`
                }
            })
            .end(done);
    });
    it("GET /api/domains/{code}/subdomains", function (done) {

        request(app)
            .get('/api/domains/GRP.009/subdomains')
            .expect(200)
            .expect('Content-Type', /application\/json/)
            .expect(SUBDOMAINS_RESULT)
            .end(done);
    });

    it("GET /api/domains/{code}/capabilities", function (done) {

        request(app)
            .get('/api/domains/DMN.042/capabilities')
            .expect(200)
            .expect('Content-Type', /application\/json/)
            .expect(DOMAIN_CAPABILITIES)
            .end(done);
    });

    it("POST /api/domains", function (done) {

        request(app)
            .post('/api/domains')
            .send( CREATE_ROOT_DOMAIN_BODY )
            .expect(200)
            .expect('Content-Type', /application\/json/)
            .expect({})
            .end(done);
    });

})

