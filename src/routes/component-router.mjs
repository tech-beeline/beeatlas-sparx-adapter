import express from 'express'
import { NotImplementedRoute } from '../utils/href.mjs';

const ComponentRoutes = express.Router();

ComponentRoutes.get('/', NotImplementedRoute)
ComponentRoutes.get('/:code', NotImplementedRoute)
ComponentRoutes.get('/:code/interfaces', NotImplementedRoute)

export default ComponentRoutes;