-- Агрегированная статистика по действиям

CREATE TABLE IF NOT EXISTS arch_metrics.PLUGIN_ACTIONS_STAT
(
    ID BIGSERIAL PRIMARY KEY,	-- Уникальный идентификатор записи
    VERSION VARCHAR(80) NOT NULL,	-- версия плагина
    ACTION VARCHAR(255) NOT NULL,	-- тип выполняемого действия
    PLUGIN_USER VARCHAR(255),	-- Пользователь плагина
	TEMPLATE_ID VARCHAR(255), -- Идентификатор архитектурного шаблона
    CMDB VARCHAR(255), -- CMDB мнемоника приложения из workspace.dsl
	ELEMENT_UID VARCHAR(255),
    COUNT BIGINT
);

ALTER TABLE arch_metrics.PLUGIN_ACTIONS_STAT ADD CONSTRAINT PK_PLUGIN_ACTIONS_STAT_KEYS UNIQUE  (VERSION,ACTION,PLUGIN_USER, TEMPLATE_ID, CMDB, ELEMENT_UID);

COMMENT ON TABLE arch_metrics.PLUGIN_ACTIONS_STAT IS 'Агрегированная статистика по действиям VARP плагина';
COMMENT ON COLUMN arch_metrics.PLUGIN_ACTIONS_STAT.ID IS 'Уникальный идентификатор записи';
COMMENT ON COLUMN arch_metrics.PLUGIN_ACTIONS_STAT.VERSION IS 'Версия плагина';
COMMENT ON COLUMN arch_metrics.PLUGIN_ACTIONS_STAT.ACTION IS 'Тип выполненного через плагин действия';
COMMENT ON COLUMN arch_metrics.PLUGIN_ACTIONS_STAT.PLUGIN_USER IS 'Пользователь плагина, выполнившего действие';
COMMENT ON COLUMN arch_metrics.PLUGIN_ACTIONS_STAT.TEMPLATE_ID IS 'Идентификатор использованного архитектурного шаблона';
COMMENT ON COLUMN arch_metrics.PLUGIN_ACTIONS_STAT.CMDB IS 'CMDB мнемоника приложения из workspace.dsl';
COMMENT ON COLUMN arch_metrics.PLUGIN_ACTIONS_STAT.ELEMENT_UID IS 'Идентификатор элемента в workspace, над которым произведено действие';

-- Лог действий, выполенных через плагин

CREATE TABLE IF NOT EXISTS arch_metrics.PLUGIN_ACTIONS_LOG -- Информация о действиях, выполненных плагином VARP
(
    ID BIGSERIAL PRIMARY KEY,	-- Уникальный идентификатор записи
	STAT_ID	BIGINT NOT NULL REFERENCES arch_metrics.PLUGIN_ACTIONS_STAT (ID),
    VERSION VARCHAR(80) NOT NULL,	-- версия плагина
    ACTION VARCHAR(255) NOT NULL,	-- тип выполняемого действия
    PLUGIN_USER VARCHAR(255),	-- Пользователь плагина
	TEMPLATE_ID VARCHAR(255), -- Идентификатор архитектурного шаблона
    CMDB VARCHAR(255), -- CMDB мнемоника приложения из workspace.dsl
	ELEMENT_UID VARCHAR(255),
    BODY JSONB, -- Полная информация о событии
    LOG_DATE TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Дата события
);

COMMENT ON TABLE arch_metrics.PLUGIN_ACTIONS_LOG IS 'Информация о действиях, выполненных плагином VARP';
COMMENT ON COLUMN arch_metrics.PLUGIN_ACTIONS_LOG.ID IS 'Уникальный идентификатор записи';
COMMENT ON COLUMN arch_metrics.PLUGIN_ACTIONS_LOG.STAT_ID IS 'Идентификатор записи в таблице статистики';
COMMENT ON COLUMN arch_metrics.PLUGIN_ACTIONS_LOG.VERSION IS 'Версия плагина';
COMMENT ON COLUMN arch_metrics.PLUGIN_ACTIONS_LOG.ACTION IS 'Тип выполненного через плагин действия';
COMMENT ON COLUMN arch_metrics.PLUGIN_ACTIONS_LOG.PLUGIN_USER IS 'Пользователь плагина, выполнившего действие';
COMMENT ON COLUMN arch_metrics.PLUGIN_ACTIONS_LOG.TEMPLATE_ID IS 'Идентификатор использованного архитектурного шаблона';
COMMENT ON COLUMN arch_metrics.PLUGIN_ACTIONS_LOG.CMDB IS 'CMDB мнемоника приложения из workspace.dsl';
COMMENT ON COLUMN arch_metrics.PLUGIN_ACTIONS_LOG.ELEMENT_UID IS 'Идентификатор элемента в workspace, над которым произведено действие';
COMMENT ON COLUMN arch_metrics.PLUGIN_ACTIONS_LOG.BODY IS 'Полная информация о событии';
COMMENT ON COLUMN arch_metrics.PLUGIN_ACTIONS_LOG.LOG_DATE IS 'Время события';

--migration from plugin_actions

WITH cte_src AS(
	SELECT 
		version, 
		action, 
		lower(COALESCE(CASE WHEN plugin_user='null' THEN 'unknown' ELSE plugin_user END,'unknown')) as plugin_user, 
		template_id, 
		generate_series(1,count) as seq
	FROM arch_metrics.plugin_actions
), cte_stat AS (
	INSERT INTO arch_metrics.plugin_actions_stat(
		version,
		action,
		plugin_user,
		template_id,
		count
	)
	SELECT version,
		action,
		plugin_user,
		template_id,
		count(*)
	FROM cte_src
	GROUP BY version, action, plugin_user, template_id
	RETURNING *
)
INSERT INTO arch_metrics.plugin_actions_log (
	stat_id,
	version,
	action,
	plugin_user,
	template_id
)
SELECT 
	s.id,
	s.version,
	s.action,
	s.plugin_user,
	s.template_id
FROM cte_src l
	JOIN cte_stat s ON s.version=l.version
		AND s.action=l.action
		AND COALESCE( s.plugin_user,'')=COALESCE(l.plugin_user,'')
		AND COALESCE( s.template_id,'')=COALESCE(l.template_id,'');