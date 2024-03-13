import express from 'express'
import ApiRouter, { routeControllers } from './routes/index.mjs'
import SwaggerDefinition from './routes/swagger.mjs';
import SwaggerUI from 'swagger-ui-dist'
import path from 'path'
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export const app = express();

const pathToSwaggerUi = SwaggerUI.absolutePath();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//#region Маршруты для swagger UI
app.use('/swagger', express.static('./src/view/ea-board-swagger.html'))
app.use('/swagger-ui', express.static(pathToSwaggerUi));

//#endregion

const SWAGGER_DEFINITION = SwaggerDefinition.load();
app.use('/dashboard', express.static('./src/view/process-reference.html'))
app.use('/e2e-filling-status/:code/details', express.static('./src/view/e2e-filling-details.html'))
//app.use('/e2e-filling-status', express.static('./src/view/e2e-filling-status.html'))
app.use('/js', express.static('./src/view/js'))

app.use('/swagger/capabilities-api.json', (request, response) => response.json(SWAGGER_DEFINITION))//express.static('./src/swagger/capabilities-api.yaml'))

let routes = routeControllers(SWAGGER_DEFINITION, { ifErrorMarkDepricated: true, logSwaggerDescription: true });

//app.use(express.static(path.join(__dirname, 'client/build')));

//app.use('/app', express.static('./src/client/build'));
/*app.use('/*', (req, res) =>
    res.sendFile(path.join(__dirname, 'client/build/index.html')));
//app.use(express.static(path.join(__dirname, 'client/build')));
/*app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
  */

///app.get('/app*', react);

app.use('/', routes);

app.use((err, req, res, next) => {
    res.status(500).send(err.message);
})

export default app;