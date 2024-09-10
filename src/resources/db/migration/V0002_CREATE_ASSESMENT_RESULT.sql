/*
 Актуальные результаты оценки систем для этапа ПТР
*/
CREATE TABLE IF NOT EXISTS arch_metrics.system_assessment_result (
    fitness_fn_code VARCHAR(80) NOT NULL,	-- Код фитнес функции
    system_code VARCHAR(255) NOT NULL, -- CMDB мнемоника системы
    assessment_date TIMESTAMP NOT NULL,	-- Дата и время проведения проверки
    assessment_description VARCHAR,	-- Описание проверки
    assessment_status INT NOT NULL, -- Результат проверки
    result_details VARCHAR -- Детальное описание результата
);

COMMENT ON TABLE arch_metrics.system_assessment_result IS 'Актуальные результаты оценки систем для этапа ПТР';


/*
 История оценки систем для этапа ПТР
*/
CREATE TABLE IF NOT EXISTS arch_metrics.system_assessment_history (
    id BIGSERIAL NOT NULL,	-- Уникальный идентификатор проверки
    fitness_fn_code VARCHAR(80) NOT NULL,	-- Код фитнес функции
    system_code VARCHAR(255) NOT NULL, -- CMDB мнемоника системы
    assessment_date TIMESTAMP NOT NULL,	-- Дата и время проведения проверки
    assessment_description VARCHAR,	-- Описание проверки
    assessment_status INT NOT NULL, -- Результат проверки
    result_details VARCHAR -- Детальное описание результата
);

COMMENT ON TABLE arch_metrics.system_assessment_result IS 'История оценки систем для этапа ПТР';

ALTER TABLE arch_metrics.system_assessment_result ADD CONSTRAINT pk_sys_assessment_result PRIMARY KEY (fitness_fn_code,system_code);
ALTER TABLE arch_metrics.system_assessment_history ADD CONSTRAINT pk_sys_assessment_history PRIMARY KEY (id);

CREATE OR REPLACE FUNCTION arch_metrics.log_sys_assessment() RETURNS TRIGGER AS $log_sys_assessment$
BEGIN
    IF( TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
        INSERT INTO arch_metrics.system_assessment_history(
            fitness_fn_code,
            system_code,
            assessment_date,
            assessment_description, 
            assessment_status, 
            result_details)
        SELECT 
            NEW.fitness_fn_code, 
            NEW.system_code, 
            NEW.assessment_date, 
            NEW.assessment_description, 
            NEW.assessment_status, 
            NEW.result_details;
	END IF;
	RETURN NULL;
END;
$log_sys_assessment$ LANGUAGE plpgsql;

CREATE TRIGGER sys_assess
AFTER INSERT OR UPDATE OR DELETE ON arch_metrics.system_assessment_result
    FOR EACH ROW EXECUTE FUNCTION arch_metrics.log_sys_assessment();

