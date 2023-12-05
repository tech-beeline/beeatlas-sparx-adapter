import express from 'express'
import swagger from 'swagger-ui-dist'
import DomainRoutes from "./domains-routes.mjs"
import CapabilitiesRoutes from './capabilities-routes.mjs'
import ComponentRoutes from './component-router.mjs';
import InterfaceRoutes from './interface-routes.mjs';

export const Router = express.Router();

const pathToSwaggerUi = swagger.absolutePath();

console.log( pathToSwaggerUi );
//#region Маршруты для swagger UI
Router.use('/swagger', express.static('./src/view/ea-board-swagger.html'))
Router.use('/swagger/capabilities-api.yaml', express.static('./src/swagger/capabilities-api.yaml'))
Router.use('/swagger-ui', express.static(pathToSwaggerUi));
//#endregion

Router.use('/domains', DomainRoutes );
Router.use('/capabilities', CapabilitiesRoutes)
Router.use('/components', ComponentRoutes)
Router.use('/interfaces', InterfaceRoutes)

export default Router;