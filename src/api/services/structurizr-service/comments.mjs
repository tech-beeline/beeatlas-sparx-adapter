import { Container, SoftwareSystem } from "./model.mjs";

/**
 * 
 * @param {Container} c 
 * @param {SoftwareSystem} s
 * @returns 
 */
export const containerWithoutCode = (c, s) => `Контейнер "${c.name}" (sofwareSystem{name="${s.name}", cmdb="${s.properties?.cmdb}"}) не имеет внешний идентификатор и не будет выгружен в витрину ФДМ.
Для того, что бы контейнер был выгружен в витрину необходимо добавить external_name в properties
Пример:
my_container = container "${c.name}" {
        properties {
            "external_name" "${c.name.replaceAll(' ','-').toLowerCase()}"
        }
    }`;

export const containerWihoutIdentifier = (c) => `Контейнер ${c.name} не присвоен переменной.
Это значит, что на этот контейнер нельзя будет ссылаться другим элементам.
`;