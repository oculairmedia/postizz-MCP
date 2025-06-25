# Project: Postiz MCP Server

This project is a Model Context Protocol (MCP) server for interacting with the Postiz platform. It allows for programmatic management of Postiz content via MCP tools.

## Key Features

- **Postiz Integration:** Provides tools to create and manage content on Postiz.
- **MCP Server:** Implements the Model Context Protocol, enabling communication with MCP-compatible clients.
- **Dual Transport:** Supports both Server-Sent Events (SSE) and stdio for transport.
- **Dockerized:** Includes a `Dockerfile` and `compose.yaml` for easy setup and deployment.
- **Configurable:** Uses environment variables for configuration (e.g., Postiz API credentials).

## Project Structure

The main application logic resides in the `everything/` directory.

- `everything/src/`: Contains the core source code.
  - `core/`: The main server implementation.
  - `tools/`: Defines the MCP tools for Postiz integration (e.g., `postiz-tools.js`, `create-post.js`).
  - `transports/`: Implements the SSE and stdio transports.
- `everything/package.json`: Lists the Node.js dependencies for the server.
- `Dockerfile` and `compose.yaml`: Define the Docker container and services.

## How to Run

The server can be run using Docker Compose:

```bash
docker-compose up -d
```

Configuration is managed through a `.env` file, which can be created by copying `.env.example`.

## Available Tools

Based on the files in `everything/src/tools/`, the server likely exposes tools for:

- Creating posts
- Getting posts
- Getting integrations
- User login
