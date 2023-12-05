import express from 'express'
import CapabilitiesController from '../controllers/capabilities-controller.mjs';
import { NotImplementedRoute } from '../utils/href.mjs';

const CapabilitiesRoutes = express.Router();

CapabilitiesRoutes.get('/', CapabilitiesController.getCapabilities);
CapabilitiesRoutes.get('/:code', CapabilitiesController.getCapabilityByCode);
CapabilitiesRoutes.get('/:code/children', CapabilitiesController.getCapabilityChildren);
CapabilitiesRoutes.get('/:code/realizations', CapabilitiesController.getCapabilityRealizations);

export default CapabilitiesRoutes