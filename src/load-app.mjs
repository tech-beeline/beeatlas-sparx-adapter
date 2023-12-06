import express from 'express'
import ApiRouter, { routeControllers } from './routes/index.mjs'
import SwaggerDefinition from './routes/swagger.mjs';
import SwaggerUI from 'swagger-ui-dist'

export const app = express();

const pathToSwaggerUi = SwaggerUI.absolutePath();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//#region Маршруты для swagger UI
app.use('/swagger', express.static('./src/view/ea-board-swagger.html'))
app.use('/swagger-ui', express.static(pathToSwaggerUi));

//#endregion

const SWAGGER_DEFINITION = SwaggerDefinition.load();

app.use('/swagger/capabilities-api.json', (request, response) => response.json(SWAGGER_DEFINITION))//express.static('./src/swagger/capabilities-api.yaml'))

let routes = routeControllers(SWAGGER_DEFINITION, { ifErrorMarkDepricated: true, logSwaggerDescription: true });

app.use('/', routes);
app.use((err, req, res, next) => {
    res.status(500).send(err.message);
})

export default app;