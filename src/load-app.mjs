import express from 'express'
import ApiRouter, { routeControllers } from './routes/index.mjs'
import SwaggerDefinition from './routes/swagger.mjs';
import SwaggerUI from 'swagger-ui-dist'
import path from 'path'
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import RESTMetric from './metrics/middleware.mjs';
import API_ROUTES from './api/specifications/index.mjs'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export const app = express();

const pathToSwaggerUi = SwaggerUI.absolutePath();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/actuator/prometheus', RESTMetric);


//#region Маршруты для swagger UI
app.use('/swagger-ui', express.static(pathToSwaggerUi));
app.use('/swagger', express.static('./src/view/ea-board-swagger.html'))

app.use(API_ROUTES)
//#endregion

const SWAGGER_DEFINITION = SwaggerDefinition.load();

app.use('/js', express.static('./src/view/js'))

app.use('/swagger/api.json', (request, response) => response.json(SWAGGER_DEFINITION))//express.static('./src/swagger/capabilities-api.yaml'))

let routes = routeControllers(SWAGGER_DEFINITION, { ifErrorMarkDepricated: true, logSwaggerDescription: true });
app.use('/', routes);

app.use(express.static(path.join(__dirname, 'client/build')));


app.use('*', (req, res) =>
    res.sendFile(path.join(__dirname, 'client/build/index.html')));

///app.get('/app*', react);



app.use((err, req, res, next) => {
    res.status(500).send(err.message);
})

export default app;