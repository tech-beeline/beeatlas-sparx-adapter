CREATE TABLE IF NOT EXISTS mapic.products
(
    cmdb        VARCHAR(255) UNIQUE,                  -- CMDB мнемоника приложения из workspace.dsl
    id          INT PRIMARY KEY,                      -- Идентификатор продукта в MAPIC
    load_date   TIMESTAMP DEFAULT CURRENT_TIMESTAMP   -- Время последнего обновления
);

COMMENT ON TABLE mapic.products IS 'Продукты в мапике';

COMMENT ON COLUMN mapic.products.cmdb       IS 'CMDB мнемоника приложения из workspace.dsl';
COMMENT ON COLUMN mapic.products.id         IS 'Идентификатор продукта в MAPIC';
COMMENT ON COLUMN mapic.products.load_date  IS 'Время последнего обновления';


CREATE TABLE IF NOT EXISTS mapic.capabilities
(
    id          INT PRIMARY KEY,                    -- ID возможности в MAPIC
    product_id  INT REFERENCES mapic.products(id),  -- ID продукта в MAPIC
    name        TEXT,                               -- Название   
    status      VARCHAR(255)                        -- Статус возможности MAPIC
);

COMMENT ON TABLE mapic.capabilities IS 'Возможности продукта';

COMMENT ON COLUMN mapic.capabilities.id         IS 'ID возможности в MAPIC';
COMMENT ON COLUMN mapic.capabilities.product_id IS 'ID продукта в MAPIC';
COMMENT ON COLUMN mapic.capabilities.name       IS 'Название возможности';
COMMENT ON COLUMN mapic.capabilities.status     IS 'Статус возможности MAPIC';


CREATE TABLE IF NOT EXISTS mapic.api
(
    id              INT PRIMARY KEY,                        -- ID API
    capability_id   INT REFERENCES mapic.capabilities(id),  -- ID возможности в MAPIC
    status          VARCHAR(255),                           -- Статус API MAPIC
    context         VARCHAR(255),                           -- Контекст провайдера
    spec            TEXT                                    -- Спецификация API
);

COMMENT ON TABLE mapic.api IS 'API возможности';

COMMENT ON COLUMN mapic.api.id              IS  'ID API в MAPIC';
COMMENT ON COLUMN mapic.api.capability_id   IS  'ID возможности в MAPIC';
COMMENT ON COLUMN mapic.api.status          IS  'Статус API';
COMMENT ON COLUMN mapic.api.context         IS  'Контекст провайдера';
COMMENT ON COLUMN mapic.api.spec            IS  'Спецификация API';


CREATE TABLE IF NOT EXISTS mapic.published_api
(
    id              INT PRIMARY KEY,                -- ID публикации API
    api_id          INT REFERENCES mapic.api(id),   -- ID api в MAPIC
    status          VARCHAR(255),                   -- Статус API MAPIC
    context         VARCHAR(255),                   -- Контекст публикации
    spec            TEXT                            -- Спецификация опубликованного API
);

COMMENT ON TABLE mapic.published_api IS 'Публикация API';

COMMENT ON COLUMN mapic.published_api.id        IS  'ID публикация';
COMMENT ON COLUMN mapic.published_api.api_id    IS  'ID API';
COMMENT ON COLUMN mapic.published_api.status    IS  'Статус публикации';
COMMENT ON COLUMN mapic.published_api.context   IS  'контекст публикации';
COMMENT ON COLUMN mapic.published_api.spec      IS  'Спецификация';