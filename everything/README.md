# Postiz MCP Server

This MCP server provides integration with the Postiz social media management platform through the Postiz API. It allows you to manage your social media posts programmatically through MCP tools.

## Features

- Create social media posts across multiple platforms
- List and manage posts
- Get social media integrations/accounts
- Supports HTTP, SSE, and stdio transports

## Tools

### 1. `create_post`
Creates a new social media post in Postiz
- Inputs:
  - `content` (string, required): The content of the post
  - `platforms` (array, optional): List of platforms to post to
  - `schedule_date` (string, optional): When to schedule the post

### 2. `get_posts`
Lists posts from Postiz with pagination and filtering options
- Inputs:
  - `page` (integer, optional): Page number for pagination
  - `limit` (integer, optional): Number of posts per page
  - `status` (string, optional): Filter by post status

### 3. `get_integrations`
Retrieves connected social media accounts/integrations
- No inputs required

## Configuration

The server requires the following environment variables:

- `POSTIZ_API_URL`: The base URL for the Postiz API (default: https://postiz.oculair.ca/api)
- `POSTIZ_API_KEY`: Your Postiz API key (required)
- `PORT`: The port to run the HTTP server on (default: 3084)
- `TRANSPORT`: The transport method to use (http, sse, or stdio)

## Running the Server

### Using Node.js directly:
```bash
# With stdio transport (default)
node src/index.js

# With HTTP transport
node src/index.js --http

# With SSE transport
node src/index.js --sse
```

### Using npm scripts:
```bash
# Development mode
npm run dev        # stdio
npm run dev:http   # HTTP
npm run dev:sse    # SSE

# Production mode (with TypeScript build)
npm run build
npm start          # stdio
npm run start:http # HTTP
npm run start:sse  # SSE
```

### Using Docker:
```bash
docker run -e POSTIZ_API_KEY=your-api-key -p 3084:3084 oculair/postiz-mcp:latest
```

## API Endpoints (HTTP Transport)

When running with HTTP transport, the following endpoints are available:

- `GET /health` - Health check endpoint
- `POST /mcp` - MCP protocol endpoint
- `GET /sse` - Server-sent events endpoint (for SSE transport)

## Security

The server includes:
- Origin validation for HTTP requests
- DNS rebinding protection
- API key authentication for Postiz API calls