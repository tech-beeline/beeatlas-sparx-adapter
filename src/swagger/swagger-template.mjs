
const SWAGGER_TEMPLATE = (title = "Swagger Beeline EA Capability - OpenAPI 3.0", description = "Интерфейс для управления моделью возможностей в корпоративном архитектурном репозитории Sparx EA", version = "1.1.0") => ({
  openapi: "3.0.3",
  info: {
    title: title,
    description: description,
    contact: {
      "email": "ivvoronin@beeline.ru"
    },
    version: version
  },
  components: {
    schemas: {
    },
    examples: {
    }
  }
});

export default SWAGGER_TEMPLATE;