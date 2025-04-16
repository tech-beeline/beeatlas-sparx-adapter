import {
    arraySchema,
    GetJSONOperation,
    pathParameter,
    SimpleServiceSpecification,
    stringProperty
} from "../specifications/helpers.mjs";
import { DigitalArchitectControllers } from "./controllers.mjs";

export const ARCHITECT_USER_LIST_RESOURCE = "/api/v4/digital-arhitect/users";
export const ARCHITECT_USER_ACTIONS_RESOURCE = "/api/v4/digital-arhitect/users/{login}/actions";

const controllers = new DigitalArchitectControllers();

const SWAGGER = new SimpleServiceSpecification(`Цифровой архитектор`, `Получение и управление инфомрацией о цифровом профиле архитектора`);
const loginParameter = pathParameter("login", "Логин пользователя", "alsevasilenko");

const USER_SCHEMA_REF = SWAGGER.defineEntitySchema("User", {
    type: "object",
    properties: {
        login: stringProperty("Имя пользователя", { example: "tutkinaie" })
    }
});

SWAGGER.defineGet(ARCHITECT_USER_LIST_RESOURCE, new GetJSONOperation("Получение списка пользоваталей", [], arraySchema(USER_SCHEMA_REF), controllers.getUsers));
SWAGGER.defineGet(ARCHITECT_USER_ACTIONS_RESOURCE, new GetJSONOperation("Получение списка пользоваталей", [loginParameter],
    arraySchema(USER_SCHEMA_REF), controllers.getUserActions));

export default SWAGGER;
