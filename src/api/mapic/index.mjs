import express from 'express'
import https from 'https';
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
import { MapicApi, MapicCapability, MapicProduct, MapicPublishedApi } from './model/product.mjs';
import { MapicLoadRepository } from './repository/index.mjs';

const MAPIC_URL = process.env.MAPIC_URL;

const AUTH_RESUORCE = `${MAPIC_URL}/api/v7/token`
const PRODUCTS_RESUORCE = `${MAPIC_URL}/api/v7/products`
const CAPABILITY_RESUORCE = (product_id) => `${MAPIC_URL}/api/v7/products/${product_id}/capabilities`;
const API_RESUORCE = (capability_id) => `${MAPIC_URL}/api/v7/capabilities/${capability_id}/api`;
const API_SPEC_RESUORCE = (id) => `${MAPIC_URL}/api/v7/api/${id}/specification`;
const PUBLISHED_API_RESUORCE = (id) => `${MAPIC_URL}/api/v7/api/${id}/published-api`;
const PUBLISHED_API_SPEC_RESUORCE = (id) => `${MAPIC_URL}/api/v7/published-api/${id}/spec`;


const MAPIC_USER = process.env.MAPIC_USER;
const MAPIC_PASSWORD = process.env.MAPIC_PASSWORD_BASE64 ? Buffer.from(process.env.MAPIC_PASSWORD_BASE64, 'base64').toString('ascii') : process.env.MAPIC_PASSWORD;

const repository = new MapicLoadRepository();


class PublishedApiStatus extends MapicPublishedApi {
    summary;
    /**
     *
     */
    constructor(val, api) {
        super(val);
        this.api = api;
    }
    async store() {
        return repository.updatePublishedApi(this);
    }
    async updateSpec() {
        try {
            const response = await fetch(PUBLISHED_API_SPEC_RESUORCE(this.id), this.api.loadStatus.request_options);
            if (response.status != 200) throw Error(`Ошибка при вызове MAPIC status=${response.status}, message = ${await response.text()}`);
            return repository.updatePublishedApiSpec(this.id, await response.text());
        } catch (error) {
            console.error(error);
        }
    }
}


class ApiStatus extends MapicApi {
    summary;
    /**
     *
     */
    constructor(val, capability) {
        super(val);
        this.capability = capability;
    }
    setStatus(status) {
        console.log(this.summary = `[api id=${this.id}, capability=${this.capability.name}]:${status}`);
    }
    async store() {
        try {
            return repository.updateApi(this);
        } catch (error) {
            const err_msg = `Ошибка при сохранении в базу:${error.message}`;
            this.setStatus(err_msg);
            throw Error(err_msg, { cause: error })
        }
    }
    async updateSpec() {
        try {
            this.setStatus("Обновление спецификации")
            const response = await fetch(API_SPEC_RESUORCE(this.id), this.capability.loadStatus.request_options);
            if (response.status !== 200) throw Error(`Ошибка при вызове MAPIC status=${response.status}, message = ${await response.text()}`);
            return repository.updateApiSpec(this.id, await response.text());
        } catch (error) {
            const err_msg = `Ошибка обновлении спецификации:${error.message}`;
            this.setStatus(err_msg);
            //throw Error(err_msg, { cause: error })
        }
    }
    async updatePublishedApi() {
        try {
            this.setStatus("Обновление published api");
            const response = await fetch(PUBLISHED_API_RESUORCE(this.id), this.capability.loadStatus.request_options);
            if (response.status !== 200) throw Error(`Ошибка при вызове MAPIC status=${response.status}, message = ${await response.text()}`);
            this.published_api = (await response.json()).map(a => new PublishedApiStatus(a, this));
            for (const papi of this.published_api) {
                await papi.store();
                if (papi.status != 'Rejected') await papi.updateSpec();
            }
        } catch (error) {
            const err_msg = `Ошибка обновлении published api:${error.message}`;
            console.error(error);
            this.setStatus(err_msg);
            //throw Error(err_msg, { cause: error })
        }
    }
    get loadStatus() {
        return this.capability.loadStatus;
    }
}

class CapabilityStatus extends MapicCapability {

    /**@type {string} */
    summary;
    /**@type {ApiStatus[]} */
    api_list;
    /**
     *
     */
    constructor(val, product) {
        super(val);
        super.product = product;
    }
    get loadStatus() {
        return this.product.loadStatus;
    }
    get product_id() {
        return this.product.id
    }
    async store() {
        await repository.updateCapability(this);
    }
    setStatus(status) {
        console.log(this.summary = `Возможность [product_id=${this.product.id} cmdb=${this.product.cmdb} id=${this.id} name=${this.name}]: ${status}`);
    }
    async loadApi() {
        try {
            this.setStatus("Выгрузка из MAPIC");
            const response = await fetch(API_RESUORCE(this.id), this.product.loadStatus.request_options);
            if (response.status !== 200) throw Error(`ошибка при загрузке из MAPIC: ${await response.text()}`);
            this.api_list = (await response.json()).map(a => new ApiStatus(a, this));
            for (const api of this.api_list) {
                await api.store();
                await api.updateSpec();
                await api.updatePublishedApi();
            }
            this.setStatus("Данные обновлены");

        } catch (error) {
            console.error(error);
            this.setStatus(`Ошибка при загрузке возможностей: ${error.message}`);
        }
    }
}

class ProductStatus extends MapicProduct {
    /** @type {string} */
    summary;
    /**@type {CapabilityStatus[]} */
    capabilities;
    /**@type {LoadStatus} */
    loadStatus;
    constructor(val, loadStatus) {
        super(val)
        this.loadStatus = loadStatus;
    }
    setStatus(status) {
        console.log(this.summary = `Продукт [id=${this.id}, cmdb=${this.cmdb}]: ${status}`);
    }
    async store() {
        this.setStatus("Сохранение в базу данных информации о продукте");
        await repository.updateProduct(this);
        this.setStatus("Информация сохранена");
    }
    async loadCapabilitites() {
        this.setStatus("Загрузка возможностей");
        try {
            const response = await fetch(CAPABILITY_RESUORCE(this.id), this.loadStatus.request_options);
            if (response.status !== 200) throw Error(`Ошибка при запросе MAPIC: ${await response.text()}`);
            this.capabilities = (await response.json()).map(c => new CapabilityStatus(c, this));
            this.setStatus("Возможности загружены из MAPIC")
            for (const c of this.capabilities) {
                await c.store();
                await c.loadApi();
            }
            this.setStatus("Возможности загружены в БД ФДМ")
        } catch (error) {
            console.error(error);
            this.setStatus(`Ошибка при загрузке возможностей: ${error.message}`);
            //throw Error(`Ошибка при загрузке возможностей: ${error.message}`, error);
        }
    }
    async load() {
        try {
            await this.store();
            await this.loadCapabilitites();
        } catch (error) {
            const msg = `Ошибка при загрузке информации о продукте: ${error.message}`;
            this.setStatus(msg)
            console.error(error);
            //throw Error(msg, error);
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
        const agent = new https.Agent({ rejectUnauthorized: false });
        const response = await fetch(AUTH_RESUORCE, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({ grant_type: "password", username: MAPIC_USER, password: MAPIC_PASSWORD })
        });
        if (!response.ok) {
            throw Error(`Ошибка при аутентификации: ${await response.text()}`);
        }
        const responce_body = await response.json();
        this.access_token = responce_body.access_token;
        if (!this.access_token) throw Error("Не получен токен при аутентификации");

        this.request_options = { headers: { Authorization: `Bearer ${this.access_token}` }, rejectUnauthorized: false };
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
        this.products = products.map(p => new ProductStatus(p, this));
        for (const product of this.products) {
            await product.load();
        }
    }

    async load() {
        try {
            this.setStatus(LOAD_STATUS.LOAD_PRODUCTS)
            await this.auth();
            this.setStatus(`${LOAD_STATUS.LOAD_PRODUCTS}: Аутентификация прошла успешно`);
            const products = await this.getProducts();
            this.setStatus(`${LOAD_STATUS.LOAD_PRODUCTS}, Список продуктов получен, получена информация о ${products.length} продуктах`)
            await this.loadProducts(products);
            console.log(`Загрузка данных MAPIC закончена`);
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
        return this.loadTask;
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
