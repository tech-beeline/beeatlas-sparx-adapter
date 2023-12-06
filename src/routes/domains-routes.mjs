import express from 'express'
import DomainsController from '../controllers/domains-controller.mjs';


const DomainRoutes = express.Router();

DomainRoutes.route('/')
    .get(DomainsController.getDomains)
    .post(DomainsController.createDomain);

DomainRoutes.route('/:code')
    .get(DomainsController.getDomainByCode)
DomainRoutes.route('/:code/subdomains')
    .get(DomainsController.getSubdomains)
DomainRoutes.route('/:code/capabilities')
    .get(DomainsController.getDomainCapabilities);

export default DomainRoutes