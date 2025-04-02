CREATE TABLE IF NOT EXISTS arch_metrics.PUT_SYSTEM_LOG
(
    ID BIGSERIAL PRIMARY KEY,	-- Уникальный идентификатор записи
    LOG_DATE TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Дата события
    SYSTEM_CODE VARCHAR(255),
    ERROR JSONB,
    CURRENT_STATE JSONB,
    TARGET_STATE JSONB,
    RESULT_STATE JSONB
);


COMMENT ON TABLE arch_metrics.PUT_SYSTEM_LOG IS 'Лог пубилкации систем в sparx';
COMMENT ON COLUMN arch_metrics.PUT_SYSTEM_LOG.ID IS 'Уникальный идентификатор записи';
COMMENT ON COLUMN arch_metrics.PUT_SYSTEM_LOG.LOG_DATE IS 'Дата пубиликации';
COMMENT ON COLUMN arch_metrics.PUT_SYSTEM_LOG.ERROR IS 'Ошибка публикации';
COMMENT ON COLUMN arch_metrics.PUT_SYSTEM_LOG.CURRENT_STATE IS 'Начальное состояние';
COMMENT ON COLUMN arch_metrics.PUT_SYSTEM_LOG.TARGET_STATE IS 'Целевое состяние';
COMMENT ON COLUMN arch_metrics.PUT_SYSTEM_LOG.RESULT_STATE IS 'Конечный результат';