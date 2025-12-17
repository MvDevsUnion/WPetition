# Docker Setup Guide

## Overview

This project uses Docker Compose to run both the frontend and API in containers with Nginx as a unified gateway.

### Architecture

```
┌─────────────────────────────────────────┐
│  Browser (localhost:8080)               │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│  Nginx Container                        │
│  - Serves static frontend files         │
│  - Proxies /api/* to backend            │
│  - Proxies /swagger to backend          │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│  .NET API Container                     │
│  - ASP.NET Core 9.0                     │
│  - Connects to MongoDB on host          │
└─────────────────────────────────────────┘
```

## Prerequisites

- Docker Desktop installed and running
- MongoDB running on your host machine (port 27017)
- Port 9755 available on your host

## Quick Start

### 1. Build and Start Containers

```bash
docker compose build
docker compose up -d
```

### 2. Access the Application

- **Frontend**: http://localhost:9755
- **API** (via proxy): http://localhost:9755/api/*
- **Swagger UI**: http://localhost:9755/swagger

### 3. View Logs

```bash
# View all logs
docker compose logs -f

# View specific service logs
docker compose logs -f nginx
docker compose logs -f submission.api
```

### 4. Stop Containers

```bash
docker compose down
```

## Making Changes

### Frontend Changes (HTML/CSS/JS)

1. Edit files in the `Frontend/` directory
2. Rebuild the nginx container:
   ```bash
   docker compose build nginx && docker compose up -d
   ```

### API Changes (.NET/C# Code)

1. Edit files in the `Submission.Api/` directory
2. Rebuild the API container:
   ```bash
   docker compose build submission.api && docker compose up -d
   ```

### Both Frontend and API Changed

```bash
docker compose build && docker compose up -d
```

## Common Commands

### Container Management

```bash
# Start containers
docker compose up -d

# Stop containers
docker compose down

# Restart containers
docker compose restart

# View running containers
docker compose ps

# Remove all containers and volumes
docker compose down -v
```

### Logs and Debugging

```bash
# Follow all logs
docker compose logs -f

# View last 50 lines of API logs
docker compose logs --tail=50 submission.api

# View last 50 lines of Nginx logs
docker compose logs --tail=50 nginx

# Execute command inside API container
docker compose exec submission.api /bin/bash
```

### Rebuilding

```bash
# Rebuild all containers
docker compose build

# Rebuild with no cache (clean build)
docker compose build --no-cache

# Rebuild specific service
docker compose build nginx
docker compose build submission.api
```

## Configuration

### MongoDB Connection

The API connects to MongoDB on your host machine using `host.docker.internal:27017`.

To change the MongoDB connection:
1. Edit `compose.yaml`
2. Update the `MongoDbSettings__ConnectionString` environment variable
3. Restart containers

```yaml
environment:
  - MongoDbSettings__ConnectionString=mongodb://host.docker.internal:27017
```

### Port Configuration

The application is exposed on port 9755. To change this:
1. Edit `compose.yaml`
2. Update the nginx ports mapping:
   ```yaml
   ports:
     - "9755:80"  # Change 9755 to your desired port
   ```
3. Restart containers

### API Base URL (Frontend)

The frontend API configuration is in `Frontend/index.html` at line 105:
```javascript
const API_CONFIG = {
    baseUrl: ''  // Empty for same-origin requests
};
```

This is set to empty because Nginx proxies all `/api/*` requests to the backend.

## File Structure

```
.
├── compose.yaml                    # Docker Compose configuration
├── nginx/
│   ├── Dockerfile                  # Nginx container definition
│   └── nginx.conf                  # Nginx configuration
├── Frontend/                       # Static frontend files
│   ├── index.html
│   ├── style.css
│   └── fonts/
└── Submission.Api/
    ├── Dockerfile                  # API container definition
    └── ...                         # .NET source files
```

## Troubleshooting

### MongoDB Connection Issues

**Problem**: API can't connect to MongoDB on host

**Solution**:
1. Verify MongoDB is running on host: `mongosh --eval "db.version()"`
2. Check MongoDB is listening on `0.0.0.0:27017` not just `127.0.0.1`
3. Check Windows Firewall isn't blocking the connection
4. Verify the connection string in `compose.yaml` uses `host.docker.internal`

### Port 9755 Already in Use

**Problem**: Error binding to port 9755

**Solution**:
1. Find what's using the port: `netstat -ano | findstr :9755`
2. Either stop that process or change the port in `compose.yaml`

### Container Won't Start

**Problem**: Container crashes on startup

**Solution**:
```bash
# Check logs for errors
docker compose logs submission.api

# Rebuild with no cache
docker compose build --no-cache

# Remove old containers and rebuild
docker compose down
docker compose up -d
```

### Changes Not Reflected

**Problem**: Code changes don't appear after rebuild

**Solution**:
```bash
# Force rebuild and restart
docker compose down
docker compose build --no-cache
docker compose up -d
```

### Nginx 502 Bad Gateway

**Problem**: Nginx can't reach the API

**Solution**:
1. Check API container is running: `docker compose ps`
2. Check API logs: `docker compose logs submission.api`
3. Verify API is listening on port 8080
4. Check both containers are on the same network

## Production Deployment

For production deployment:

1. **Update API base URL**: Change port 8080 to 80 (or use a reverse proxy)
2. **MongoDB**: Use a proper MongoDB connection string with authentication
3. **HTTPS**: Add SSL certificates to Nginx configuration
4. **Environment variables**: Use `.env` file for sensitive configuration
5. **Logging**: Configure proper log aggregation
6. **Health checks**: Add Docker health checks to compose.yaml

### Example Production Changes

```yaml
# compose.yaml
services:
  nginx:
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./ssl:/etc/nginx/ssl:ro

  submission.api:
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - MongoDbSettings__ConnectionString=${MONGODB_CONNECTION_STRING}
```

## Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [ASP.NET Core in Docker](https://docs.microsoft.com/en-us/aspnet/core/host-and-deploy/docker/)

## Support

For issues or questions:
1. Check container logs: `docker compose logs -f`
2. Verify all services are running: `docker compose ps`
3. Review this documentation
4. Check Docker Desktop is running and healthy
