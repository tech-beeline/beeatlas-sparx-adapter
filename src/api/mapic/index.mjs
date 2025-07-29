import express from 'express'
import {
    arraySchema,
    booleanProperty,
    dateTimeProperty,
    GetJSONOperation,
    JSONOperation,
    pathParameter,
    SimpleServiceSpecification,
    stringProperty
} from "../specifications/helpers.mjs";
import { BadRequest, NotImplemented } from "../../utils/errors.mjs";
import fdmStorage from "../repositories/fdm-storage.mjs";

const MAPIC_URL = process.env.MAPIC_URL ?? "https://stage.mapic-dev.vimpelcom.ru"
const AUTH_RESUORCE = `${MAPIC_URL}/api/v7/token`
const PRODUCTS_RESUORCE = `${MAPIC_URL}/api/v7/products`

const MAPIC_USER = process.env.MAPIC_USER;
const MAPIC_PASSWORD = process.env.MAPIC_PASSWORD_BASE64 ? Buffer.from(process.env.MAPIC_PASSWORD_BASE64, 'base64').toString('ascii') : process.env.MAPIC_PASSWORD;

class PublishedApiStatus {
    status;
}
class ApiStatus {
    summary;
    published_api;
}
class CapabilityStatus {
    /**@type {string} */
    summary;
    api_list;
}

class ProductStatus {
    /**@type {number} */
    id;
    cmdb;
    /** @type {string} */
    summary;
    /**@type {CapabilityStatus[]} */
    capabilities;
    /**
     *
     */
    constructor(val) {
        this.id = val.id;
        console.log(val);
    }
    setStatus(status) {
        console.log(this.summary = `Продукт [id=${this.id}, cmdb=${this.cmdb}] : ${status}`);
    }
    async store(){
    }
    async load() {
        try {
            this.setStatus("Сохранение в базу данных информации о продукте");
            NotImplemented();
        } catch (error) {
            this.setStatus(`Ошибка при загрузке возможностей продукта $id=${this.id} cmdb=${this.cmdb}: ${error.message}`)
            console.error(error);
        }
    }
}

const LOAD_STATUS = {
    INIT: "Задача создана",
    LOAD_PRODUCTS: "Получение списка продуктов",
    LOAD_CAPABILITIES: "Загрузка возможностей продуктов"
}
class LoadStatus {
    summary;
    /**@type {ProductStatus[]} */
    products;
    access_token;
    request_options;
    /**
     *
     */
    constructor() {
        this.setStatus(LOAD_STATUS.INIT);
    }
    setStatus(status) {
        console.log(this.summary = status);
    }
    async auth() {
        const response = await fetch(AUTH_RESUORCE, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({ grant_type: "password", username: MAPIC_USER, password: MAPIC_PASSWORD }),
        });
        if (response.status !== 200) {
            throw Error(`Ошибка при аутентификации: ${await response.text()}`);
        }
        const responce_body = await response.json();
        this.access_token = responce_body.access_token;
        if (!this.access_token) throw Error("Не получен токен при аутентификации");

        this.request_options = { headers: { Authorization: `Bearer ${this.access_token}` } };
    }
    async getProducts() {
        const response = await fetch(PRODUCTS_RESUORCE, this.request_options);
        if (response.status !== 200) {
            throw Error(`Ошибка при загрузке продуктов: ${await response.text()}`);
        }
        return response.json();
    }
    async loadProducts(products) {
        const stage = LOAD_STATUS.LOAD_CAPABILITIES;
        this.products = products.map(p => new ProductStatus(p));
        return Promise.all(this.products.map(p => p.load()));
    }

    async load() {
        try {
            this.setStatus(LOAD_STATUS.LOAD_PRODUCTS)
            await this.auth();
            this.setStatus(`${LOAD_STATUS.LOAD_PRODUCTS}: Аутентификация прошла успешно`);
            const products = await this.getProducts();
            this.setStatus(`${LOAD_STATUS.LOAD_PRODUCTS}, Список продуктов получен, получена информация о ${products.length} продуктах`)
            return this.loadProducts(products)
        } catch (error) {
            this.setStatus(error.message);
            console.error("Ошибка при выгрузке из MAPIC", error);
        }
    }
}

export class MapicService {
    /** @type {LoadStatus} */
    loadTask;
    async startLoad(task) {
        if (this.loadTask && !task.restart) {
            return this.loadTask;
        }
        this.loadTask = new LoadStatus();
        this.loadTask.load();
    }
    async getLoadState() {
        NotImplemented();
    }
}

const service = new MapicService();
export class MapicControllers {
    /**
     * 
     * @param {express.Request} request 
     * @param {express.Response} response 
     */
    async postStartLoad(request, response) {
        response.json(await service.startLoad(request.body));
    }
    /**
     * 
     * @param {express.Request} request 
     * @param {express.Response} response 
     */
    async getLoadStatus(request, response) {
        response.json(service.getLoadState());
    }
}

const controllers = new MapicControllers();

export const MAPIC_RESOURCE = "/api/v4/mapic/load";

const SWAGGER = new SimpleServiceSpecification(`Интеграция с MAPIC`, `Получение информации об API в MAPIC`);

const POST_LOAD_BODY_REF = SWAGGER.defineEntitySchema("PostLoadBody", {
    type: "object",
    properties: {
        restart: booleanProperty("Принудительно рестартовать выгрузку, если она в процессе")
    }
});

const POST_LOAD_RESPONCE_BODY_REF = SWAGGER.defineEntitySchema("PostLoadResponceBody", {
    type: "object",
    properties: {
        status: stringProperty("Статус задачи"),
        date: dateTimeProperty("Время запуска")
    }
});

const PRODUCT_STATUS_SCHEMA_REF = SWAGGER.defineEntitySchema("LoadStatus", {
    type: "object",
    properties: {
        summary: stringProperty("Общий статус")
    }
});

const STATUS_RESPONSE_BODY = SWAGGER.defineEntitySchema("LoadStatus", {
    type: "object",
    properties: {
        summary: stringProperty("Общий статус"),
        products: {
            type: "array",
            items: PRODUCT_STATUS_SCHEMA_REF
        }
    }
})

SWAGGER.definePost(MAPIC_RESOURCE,
    new JSONOperation("Запуcк процесса выгрузки из MAPIC", [], POST_LOAD_BODY_REF, POST_LOAD_RESPONCE_BODY_REF, controllers.postStartLoad))
    .defineGet(MAPIC_RESOURCE, new GetJSONOperation("Получение статуса выгрузки", [], STATUS_RESPONSE_BODY, controllers.getLoadStatus));

export { SWAGGER as mapicConstrollerSwagger };
