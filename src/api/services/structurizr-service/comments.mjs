import { Component, Container, SoftwareSystem } from "./model.mjs";


export class WorkspaceError {
    /** @type {"ok"|"error"|warning} */
    level;
    summary;
    details;
    category;
    /**
    * 
    * @param {"ok"|"error"|"warning"} level 
    * @param {*} summary 
    */
    constructor(level, summary, details, category) {
        this.level = level;
        this.summary = summary;
        this.details = details;
        this.category = category;
        return this;
    }
}
export class WorkspaceCheckResult {
    /** @type {WorkspaceError} */
    cmdbError;
    comments;
}



export function errorComment(summary, details, category) {
    return new WorkspaceError("error", summary, details, category);
}
export function warningComment(summary, details, category) {
    return new WorkspaceError("warning", summary, details, category);
}


const containerExternalNameSample = (c) => `${c.properties["structurizr.dsl.identifier"].split('.').pop().replaceAll(/\s|\-\+\./g, '_').toLowerCase()} = container "${c.name}" {
    properties {
        "external_name" <mark>"${c.name.replaceAll(' ', '-').toLowerCase()}"</mark>
    }
}`;

const properties = (c, forMark, prefix = '') => Object.entries(c.properties).map(([k, v]) => forMark && forMark.find(p => p == k) ? `${prefix}<mark>${k}</mark> "${v}"` : `${prefix}${k} "${v}"`).join('\n');

const containerProperties = (c) => `Текущие свойства контейнера:
${properties(c)}`;
/**
 * 
 * @param {Container} c 
 * @param {SoftwareSystem} s
 * @returns 
 */
export const containerWithoutCode = (c, s) => warningComment(`Контейнер "${c.name}" (sofwareSystem{name="${s.name}", cmdb="${s.properties?.cmdb}"}) не имеет внешний идентификатор и не будет выгружен в витрину ФДМ.`,
    `Для того, что бы контейнер был выгружен в витрину необходимо добавить external_name в properties контейнера
Пример:
${containerExternalNameSample(c)}

${containerProperties(c)}`, "Контейнеры без external_name");

/**
 * 
 * @param {Container} c 
 * @param {*} s 
 * @returns 
 */
export const apiContainerWithoutCode = (c, s) => errorComment(`Контейнер "${c.name}" (sofwareSystem{name="${s.name}", cmdb="${s.properties?.cmdb}"}) имеет API, но не имеет внешний идентификатор и не будет выгружен в витрину ФДМ.`,
    `Следующие API не будут выгружены:
${c.components.filter(api => api.properties?.type == "api")
        .map(api => `   - ${api.name} (${api.properties["structurizr.dsl.identifier"]}, ${api.properties.external_name && `external_name="${api.properties.external_name}"`})
        `)
    }
Для того, что бы контейнер был выгружен в витрину необходимо добавить external_name в properties контейнера
Пример:
${containerExternalNameSample(c)}

${containerProperties(c)}`, "Контейнеры без external_name");

export const containerWihoutIdentifier = (c) => `Контейнер ${c.name} не присвоен переменной.
Это значит, что на этот контейнер нельзя будет ссылаться другим элементам.
`;

const buildCmdbSample = (cmdb = "CMDB.SAMPLE") => `Пример:
workspace extends landscape/workspace.dsl {
    name "Пример"
    description "Описание продукта"

    !identifiers hierarchical

    # Модель архитектуры
    model {
        properties { 
            structurizr.groupSeparator "/"
            workspace_cmdb <mark>"${cmdb}"</mark>
        }`;
export const noCmdbError = () => errorComment(`Отсутствует cmdb мнемоника (workspace_code).`,
    `CMDB мнемоника приложения должна быть установлена в model.properties.
${buildCmdbSample()}`, "Определение cmdb мнемоники приложения");

export const cmdbWarning = (s, cv) => warningComment(`В model.properties отсутствует cmdb мнемоника (workspace_cmdb).`,
    `Cmdb мнемоника берется из контекстной диаграммы [${cv.title ?? `${s.name}#${cv.key}`}], cmdb=${s.properties.cmdb}
Контекстных диаграмм может быть несколько и в этом случае нет гарантии, что используется правильная cmdb мнемоника
Что бы этого избежать рекомендуется добавить cmdb код в модель.
${buildCmdbSample(s.properties.cmdb)}
`, "Определение cmdb мнемоники приложения")

export const noSystemComment = (cmdb) => errorComment(`Не найдена sofwareSystem c properties.cmdb=${cmdb}`,
    `Для того, что бы информация о контейнерах и API приложения была выгружена в Витрину ФДМ требуется наличие одной softwareSystem с cmdb=${cmdb}
Этом можно сделать используя ссылки на систему из landscape (если они уже есть в ландшафте)
Пример:
workspace extends landscape/workspace.dsl {
  model {

        # Настраиваем возможность создания вложенных груп
        properties { 
            structurizr.groupSeparator "/"
            workspace_cmdb <mark>"${cmdb}"</mark>
        }
	//...
       
        <mark>!ref ${cmdb}</mark> {
		//.. Здесь дополнительное описание архитектуры, дополняющее или переопределяющее описание в ландшафте
	}
  }
}
Или в моделе должна быть softwareSystem с явно указанной cmdb мнемоникой
Пример:
  model {

        # Настраиваем возможность создания вложенных груп
        properties { 
            structurizr.groupSeparator "/"
            workspace_cmdb <mark>"${cmdb}"</mark>
        }
	//...
       
        FDMSHOWCASEAPP = softwareSystem "Витрина ФДМ" {
                properties {
                    cmdb <mark>"${cmdb}"</mark>
                }

		//..
	}
}`, "Проблемы с описанием системы");

export const systemNotFound = (cmdb) => errorComment(`Система с cmdb=${cmdb} не найдена на ландшафте компании.`
    `Возможные причины:
 - Ошибочное значение workspace_cmdb. В этом случае можно попытаться найти систему на витрине ФДМ 
`, "Проблемы с описанием системы");


/**
 * 
 * @param {SoftwareSystem} s 
 * @param {Container} c 
 * @param {Component} api 
 * @returns 
 */
export const apiCandidateComment = (s, c, api) => warningComment(`Component "${api.name}" возможный кандидат на API`,
    `У компонента есть одно или несколько свойств, которые могут относится к API.
При этом в свойствах не установлено type "api"

Свойства компонента:
${properties(api, ["external_name", "api_url"])}
`, "Потенциальные интерфейсы"
)

/**
 * 
 * @param {SoftwareSystem[]} systems 
 * @returns 
 */
export const tooManySystems = (systems) => errorComment(`В workspace больше одной softwareSystem с cmdb=${systems[0].properties.cmdb}`, `Найдены следующие softwareSystem:
${systems.map(s => `- "${s.name}"
Свойства системы:
${properties(s, [], '     ')}
`).join('\n')}
    `, "Проблемы с описанием системы"
);
/**
 * 
 * @param {SoftwareSystem} s 
 * @param {Container} c 
 * @param {Component} api 
 * @returns 
 */
export const apiWithoutExternalName = (s, c, api) => errorComment(`У интерфейса ${api.name} не указан external_name`,
    `Контейнер: ${c.name}
Свойства интерфейса
${properties(api)}
`, `Проблемы с описанием интерфейсов`)

/**
 * 
 * @param {SoftwareSystem} s 
 * @param {Container} c 
 * @param {Component} api 
 * @returns 
 */
export const apiWithoutSpecification = (s, c, api) => warningComment(`У интерфейса ${api.name} не указан api_url`,
    `Контейнер: ${c.name}
Для этого интерфейса не будут загружены методы из спецификации API

Свойства интерфейса
${properties(api)}
`, `Проблемы с описанием интерфейсов`)