# Postiz MCP Server

This repository contains a Model Context Protocol (MCP) server implementation for the Postiz platform.

## Features

- Supports both SSE, HTTP and stdio transports
- Provides access to Postiz API functionality through MCP tools
- Manage Postiz content
- Secure by default with non-root user in Docker
- Environment variable configuration
- Health check endpoint

## Quick Start

### Environment Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file with your Postiz API credentials:
   ```
   POSTIZ_API_URL=https://your-postiz-instance.com/api
   POSTIZ_API_KEY=your_postiz_api_key_here
   PORT=3084
   NODE_ENV=production
   ```

### Using Docker Compose

The easiest way to run the server is with Docker Compose:

```bash
docker-compose up -d
```

This will build the image if needed and start the server in detached mode.

### Using Docker Directly

You can also build and run the Docker image directly:

```bash
# Build the image
docker build -t oculair/postiz-mcp:latest .

# Run the container
docker run -p 3084:3084 --env-file .env --rm -it oculair/postiz-mcp:latest
```

### Multi-Architecture Build

To build for multiple architectures (amd64 and arm64):

1. Enable Docker Buildx:
   ```bash
   docker buildx create --use --name multiarch-builder
   docker buildx inspect --bootstrap
   ```

2. Build and push:
   ```bash
   docker buildx build --platform linux/amd64,linux/arm64 \
     -t oculair/postiz-mcp:latest \
     --push .
   ```

3. Verify the multi-architecture image:
   ```bash
   docker manifest inspect oculair/postiz-mcp:latest
   ```

## Development

### Project Structure

```
.
├── everything/
│   ├── src/
│   │   ├── core/       # Core server implementation
│   │   ├── tools/      # MCP tool implementations
│   │   ├── transports/ # Transport implementations (SSE, stdio)
│   │   └── index.js    # Main entry point
│   └── package.json    # Node.js dependencies
├── .env.example        # Example environment variables
├── .gitignore          # Git ignore file
├── compose.yaml        # Docker Compose configuration
├── Dockerfile          # Docker build configuration
└── README.md           # This file
```

### Available Tools

The server provides the following MCP tools:

- `create-post`
- `get-posts`
- `get-integrations`
- `get-self`
- `login`

For detailed information about each tool and its parameters, see the [everything/README.md](everything/README.md) file.

### Debugging

To debug the container, you can run it with an interactive shell:

```bash
docker run -p 3084:3084 --env-file .env --rm -it --entrypoint bash oculair/postiz-mcp:latest
```

## Usage with Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "postiz": {
      "url": "http://localhost:3084/sse",
      "disabled": false,
      "alwaysAllow": []
    }
  }
}