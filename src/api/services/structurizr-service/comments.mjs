import { Container, SoftwareSystem } from "./model.mjs";

/**
 * 
 * @param {Container} c 
 * @param {SoftwareSystem} s
 * @returns 
 */
export const containerWithoutCode = (c, s) => `Контейнер "${c.name}" (sofwareSystem{name="${s.name}", cmdb="${s.properties?.cmdb}"}) не имеет внешний идентификатор и не будет выгружен в витрину ФДМ.
Для того, что бы контейнер был выгружен в витрину необходимо добавить external_name в properties контейнера
Пример:
${c.name.replaceAll(/\s|\-\+\./g, '_').toLowerCase()} = container "${c.name}" {
        properties {
            "external_name" "${c.name.replaceAll(' ', '-').toLowerCase()}"
        }
    }`;

/**
 * 
 * @param {Container} c 
 * @param {*} s 
 * @returns 
 */
export const apiContainerWithoutCode = (c, s) => `Контейнер "${c.name}" (sofwareSystem{name="${s.name}", cmdb="${s.properties?.cmdb}"}) имеет API, но не имеет внешний идентификатор и не будет выгружен в витрину ФДМ.
Следующие API не будут выгружены:
${c.components.filter(api=>api.properties?.type=="api")
    .map(api=>`   - ${api.name}
        `)
}
Для того, что бы контейнер был выгружен в витрину необходимо добавить external_name в properties контейнера
Пример:
${c.name.replaceAll(/\s|\-\+\./, '_')} = container "${c.name}" {
        properties {
            "external_name" "${c.name.replaceAll(' ', '-').toLowerCase()}"
        }
    }`;

export const containerWihoutIdentifier = (c) => `Контейнер ${c.name} не присвоен переменной.
Это значит, что на этот контейнер нельзя будет ссылаться другим элементам.
`;

const CMDB_SMAPLE = `Пример:
workspace extends landscape/workspace.dsl {
    name "Пример"
    description "Описание продукта"

    !identifiers hierarchical

    # Модель архитектуры
    model {
        properties { 
            structurizr.groupSeparator "/"
            workspace_cmdb "CMDB.SAMPLE"
        }`;
export const CMDB_ERROR = `Отсутствует cmdb мнемоника (workspace_code).
CMDB мнемоника приложения должна быть установлена в model.properties.
${CMDB_SMAPLE}`

export const cmdbWarning = (s, cv) => `В model.properties отсутствует cmdb мнемоника (workspace_code). Cmdb мнемоника берется из контекстной диаграммы [${cv.title}], cmdb=${s.properties.cmdb}
Рекомендуется добавить cmdb код в модель.
#{CMDB_SMAPLE}
`

export const noSystemComment = (cmdb)=>`Не найдена sofwareSystem c properties.cmdb=${cmdb}
Для того, что бы информация о контейнерах и API приложения была выгружена в Витрину ФДМ требуется наличие одной softwareSystem с cmdb=${cmdb}
Этом можно сделать используя ссылки на систему из landscape (если они уже есть в ландшафте)
Пример:
workspace extends landscape/workspace.dsl {
  model {

        # Настраиваем возможность создания вложенных груп
        properties { 
            structurizr.groupSeparator "/"
            workspace_cmdb "FDMSHOWCASEAPP"
        }
	//...
       
        !ref FDMSHOWCASEAPP {
		//..
	}
  }
}
Или в моделе должнга бюыть softwareSystem с явно указанной cmdb мнемоникой
Пример:
  model {

        # Настраиваем возможность создания вложенных груп
        properties { 
            structurizr.groupSeparator "/"
            workspace_cmdb "FDMSHOWCASEAPP"
        }
	//...
       
        FDMSHOWCASEAPP = softwareSystem "Витрина ФДМ" {
                properties {
                    cmdb FDMSHOWCASEAPP 
                }

		//..
	}
}`;

const systemNotFound = (cmdb)=>`Система с cmdb=${cmdb} не найдена на ландшафте компании.
Возможные причины:
 - Ошибочное значение workspace_cmdb. В этом случае можно попытаться найти систему на витрине ФДМ 
`