import express from 'express'
import { NotImplementedRoute } from '../utils/href.mjs';

const InterfaceRoutes = express.Router();

InterfaceRoutes.get('/', NotImplementedRoute)
InterfaceRoutes.get('/:code', NotImplementedRoute)

export default InterfaceRoutes;