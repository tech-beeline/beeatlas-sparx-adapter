import express from 'express'
import DomainsController from '../controllers/domains-controller.mjs';


const DomainRoutes = express.Router();

DomainRoutes.route('/')
    .get(DomainsController.getDomains);
DomainRoutes.route('/:code')
    .get(DomainsController.getDomainByCode)
DomainRoutes.route('/:code/subdomains')
    .get(DomainsController.getSubdomains)
DomainRoutes.route('/:code/capabilities')
    .get(DomainsController.getDomainCapabilities)
DomainRoutes.post('/', DomainsController.createDomain);

export default DomainRoutes