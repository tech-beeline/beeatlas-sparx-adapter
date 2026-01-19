CREATE SCHEMA IF NOT EXISTS arch_metrics;

CREATE TABLE IF NOT EXISTS arch_metrics.migration_history (
    migration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    version VARCHAR(255)
);

INSERT INTO arch_metrics.migration_history(version) VALUES('V0000');