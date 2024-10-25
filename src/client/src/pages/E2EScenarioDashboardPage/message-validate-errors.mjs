export const OPERATION_GUID_NOT_FOUND = "OPERATION_GUID_NOT_FOUND";
export const PROTOCOL_NOT_SPECIFIED = "PROTOCOL_NOT_SPECIFIED";

export const ERROR_INFO = {
    [OPERATION_GUID_NOT_FOUND]: {
        summary: "Для вызова не указан метод (operation_guid)"
    },
    [PROTOCOL_NOT_SPECIFIED] : {
        summary  : "Для интерфейса не указан протокол"
    }
}