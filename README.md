# Sparx Enterprise Architect adapter

A nodejs application for managing and read sparx enterprise architect repository. This application provides REST API for creating, changing and querying architecture elements from sparx repository based on Postgesql database.

## Features

- **Capaiblity Management**: Create and manage Business and Technical capabilities
- **System Management**: Create and manage infomation about system containers and interfaces, including SLA. 
- **Process Scenario Management**: Manage information about E2E process and scenarios
- **Dashboard management**: Creating grafana dashboard for E2E stage scenarios

## Technology Stack

- **Nodejs**: 22
- **UI Framework**: React
- **Database**: Postgres
- **API Documentation**: Swagger/OpenAPI

## Prerequisites

- Docker and Docker Compose installed
- Nodejs 22+ (for local development)


## Quick Start with Docker Compose

The easiest way to run the service is using Docker Compose, which will start both the application and Neo4j database:

```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build
```

This will start:
- **Sparx Enterprise Architect Adapter** (ui interface) on `http://localhost:8080`
- **Postgres SQL DB (Enterprise architect repository)** on `bolt://localhost:5432`
- **Grafana** (web interface) on `http://localhost:3000`
- **Prometheus** (web interface) on `http://localhost:9090`

### Stopping the Services

```bash
# Stop services
docker-compose down

# Stop and remove volumes (this will delete all data)
docker-compose down -v
```

## API Documentation

Once the service is running, you can access the Swagger API documentation at:

```
http://localhost:8080/swagger-ui/summary
```

Or the OpenAPI JSON specification at:

```
http://localhost:8080/swagger-ui/summary/swagger.json
```


## Configuration

### Environment Variables

The service can be configured using the following environment variables:

| Variable | Description | 
|----------|-------------|
| `API_PORT` | Api prot for adapter |
| `DB_EA_USER` | Postgres DB user username |
| `DB_EA_PASSWORD` | Postgres DB user password |
| `DB_EA_URL` | Postgres DB address | 
| `DB_EA_DATABASE` | sparx ea respotiory database |
| `FDM_USERNAME` | FDM DB username | 
| `FDM_PASSWORD` | FDM DB user password |
| `FDM_URL` | FDM DB postgresql server url |
| `FDM_DATABASE` | FDM DB database name | 
| `GRAFANA_TOKEN` | Grafana access token (if used service tokjen authorization) | 
| `GRAFANA_URL` | Grafana address | 
| `GRAFANA_E2E_TEMPLATE_UID` | Grafana dashboard uid. This uid used as template for creating e2e scenario dashboard | 


### Application Properties

Key configuration in `src\client\src\resources\paths\index.mjs`:

```
export const GRAFANA_URL = "Grafana URL (for ui interface)";
export const WEB_EA_URL='Sparx WEB EA url';
```


## Project Structure

```
sparx-adapter/
├── grafana/                        # grafana confuration for docker compose
├── prometeus/                      # prometheus confuration for docker compose
├── src/
│   ├── api/                        # backend service
│   ├── client/                     # web ui application
│   ├── legacy/                     # legacy code, waiting for remove
│   ├── resources/                  # resource and db initialization function
│   ├── utils/                      # utility functions
│   └── test/
├── Dockerfile                      # Production Dockerfile
├── docker-compose.yml              # Docker Compose configuration
├── opensource.env                  # default enviroment variable for docker compose
└── README.md                       # This file
```

## Troubleshooting


### Build Issues



## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## Support

For issues and questions, please create an issue in the project repository.
