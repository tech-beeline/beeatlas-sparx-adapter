import express, { response } from 'express'
import { processGetSequenceResponse } from './api/sequence.mjs'
import swagger from 'swagger-ui-dist'
import { SPARXApi } from './api/sparx.mjs'


const app = express();
const PORT = 3000;

const pathToSwaggerUi = swagger.absolutePath();


app.use('/messages', express.static('./view/sequence-details.html'))
app.use('/swagger', express.static('./view/ea-board-swagger.html'))
app.use('/js', express.static('./view/js'))
app.use('/swagger-ui', express.static(pathToSwaggerUi));
app.use('/api/swagger/domain.yaml', express.static('./domain.yaml'));

app.get('/', async (req, res) => {
    res.send('Hello, World!')
});

/**
 * 
 * @param {express.Request} request 
 * @param {*} path 
 * @returns 
 */
function formatHREF(request, path) {
    return `${request.protocol}://${request.hostname}:${PORT}${path}`
}

app.get('/api/messages', processGetSequenceResponse);


function domainTDO(request, domain) {
    return {
        code: domain.code,
        href: formatHREF(request, `/api/domains/${domain.code}`),
        name: domain.name,
        description: domain.description,
        createdDate: domain.createdDate,
        modifiedDate: domain.modifiedDate,
        author: domain.author,
        status: domain.status,
        parent: domain.parentAlias ? {
            code: domain.parentAlias,
            href: formatHREF(request, `/api/domains/${domain.parentAlias}`)
        } : {}
    };
}

function capabilityDTO(request, capability) {
    return {
        code: capability.code,
        href: formatHREF(request, `/api/capabilities/${capability.code}`),
        name: capability.name,
        description: capability.description,
        createdDate: capability.createdDate,
        modifiedDate: capability.modifiedDate,
        author: capability.author,
        status: capability.status,
        parent: capability.parentAlias ? {
            code: capability.parentAlias,
            href: formatHREF(request, `/api/capabilities/${capability.parentAlias}`)
        } : {},
        domain: capability.domainAlias ? {
            code: capability.domainAlias,
            href: formatHREF(request, `/api/domains/${capability.domainAlias}`)
        } : {},
        owner: capability.owner ? {
            fullName: capability.owner
        } : {}
    };
}

function componentDTO( request, component ){
    return {
        name: component.name,
        code: component.code,
        status: component.status, author: component.author,
        description: component.description,
        href: formatHREF(request, `/api/components/${component.code}`)
    }
}



app.get('/api/domains', async (request, response) => {
    response.json((await SPARXApi.getDomains())
        .map(d => domainTDO(request, d)));
});


app.get('/api/domains/:code', async (request, response) => {
    let domain = await SPARXApi.getDomainByCode(request.params.code);
    if (!domain) {
        return response.status(404).send(`domain with code ${request.params.code} not found`);
    }
    response.json(domainTDO(request, domain));
});

app.get('/api/domains/:code/subdomains', async (request, response) => {
    response.json((await SPARXApi.getSubDomains(request.params.code))
        .map(d => domainTDO(request, d)));
});

app.get('/api/domains/:code/capabilities', async (request, response) => {
    let ret = await SPARXApi.getDomainCapabilities(request.params.code)
    response.json(ret.map(d => capabilityDTO(request, d)));
});

app.get('/api/capabilities', async (request, response) => {
    try {
        let clist = await SPARXApi.getCapabilities();
        response.json(clist.map(c => capabilityDTO(request, c)));
    } catch (err) {
        response.status(500).send(err.message);
    }
});

app.get('/api/capabilities/:code', async (request, response) => {
    try {
        let capability = await SPARXApi.getCapaiblity(request.params.code);
        if (capability.length == 0) {
            return response.status(404).send(`Capability with code ${request.params.code} not found`);
        }
        response.json(capabilityDTO(request, capability[0]));
    } catch (err) {
        console.error(err);
        response.status(500).send(err.message);
    }
});


app.get('/api/capabilities/:code/children', async (request, response) => {
    try {
        let capabilities = await SPARXApi.getChildCapabilities(request.params.code);
        response.json(capabilities.map(cap => capabilityDTO(request, cap)));
    } catch (err) {
        console.error(err);
        response.status(500).send(err.message);
    }
});

app.get('/api/capabilities/:code/realizations', async (request, response) => {
    try {
        let capabilities = await SPARXApi.getCapabilityRealizations(request.params.code);
        response.json(capabilities);
    } catch (err) {
        console.error(err);
        response.status(500).send(err.message);
    }
});

app.get('/api/components/:code', async (request, response) => {
    try {
        let components = await SPARXApi.getComponentByCode(request.params.code);
        if (components.length === 0) {
            return response.status(404).send(`Component with code ${request.params.code} not found`);
        }
        let interfaces = await SPARXApi.getComponentInterfaces(request.params.code);
        let component = componentDTO(request, components[0]);
        component.interfaces = interfaces.map(i => ({
            name: i.name,
            component: {
                code: request.params.code,
                href: formatHREF(request, `/api/components/${request.params.code}`)
            }
        }));
        response.json(component);
    } catch (err) {
        console.error(err);
        response.status(500).send(err.message);
    }
});

app.get('/api/components/:code/interfaces', async (request, response) => {
    try {
        let interfaces = await SPARXApi.getComponentInterfaces(request.params.code);
        response.json(interfaces.map(i => ({
            name: i.name,
            component: {
                code: request.params.code,
                href: formatHREF(request, `/api/components/${request.params.code}`)
            }
        })));
    } catch (err) {
        console.error(err);
        response.status(500).send(err.message);
    }
});




let server = app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`)
})


process.on('SIGINT', () => {
    console.log(`Stop listen and exit`);
    server.close();
})