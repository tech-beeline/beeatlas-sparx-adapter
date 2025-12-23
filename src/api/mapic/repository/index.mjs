import { NotImplemented } from "../../../utils/errors.mjs";
import fdmStorage from "../../repositories/fdm-storage.mjs";
import { MapicCapability, MapicProduct } from "../model/product.mjs";
import { UPDATE_OR_INSERT_API, UPDATE_OR_INSERT_CAPABILITY, UPDATE_OR_INSERT_PRODUCT, UPDATE_OR_INSERT_PUBLISHED_API } from "./update-product-query.mjs";

export class MapicLoadRepository {
    /**
     * 
     * @param {MapicProduct} product 
     */
    async updateProduct(product) {
        if (!product) throw Error("product is null or undefinded");
        if (!product.id) throw Error("product id is null or undefined");
        const result = await fdmStorage.query(UPDATE_OR_INSERT_PRODUCT, product.id, product.cmdb);
        Object.assign(product, result);
        return product;
    }
    /**
     * 
     * @param {MapicCapability} capability 
     */
    async updateCapability(capability) {
        if (!capability) throw Error("capability is null or undefined");
        await fdmStorage.query(UPDATE_OR_INSERT_CAPABILITY, capability.id, capability.product.id, capability.name, capability.status);
    }
    /**
     * 
     * @param {MapicCapability} api 
     */
    async updateApi(api) {
        if (!api) throw Error("api is null or undefined");
        return fdmStorage.query(UPDATE_OR_INSERT_API, api.id, api.capability.id, api.status, api.context);
    }
    /**
    * 
    * @param {MapicCapability} api 
    */
    async updateApiSpec(id, spec) {
        return fdmStorage.query("UPDATE mapic.api SET spec=$2 WHERE id=$1", id, spec);
    }
    /**
     * 
     * @param {MapicCapability} publisedApi 
     */
    async updatePublishedApi(publisedApi) {
        return fdmStorage.query(UPDATE_OR_INSERT_PUBLISHED_API, publisedApi.id, publisedApi.api.id, publisedApi.status, publisedApi.context);
    }

    async updatePublishedApiSpec(id, spec) {
        return fdmStorage.query("UPDATE mapic.published_api SET spec=$2 WHERE id=$1", id, spec);
    }

}