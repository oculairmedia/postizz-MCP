# Postiz MCP Server

A Model Context Protocol (MCP) server that provides integration with the Postiz social media management platform, enabling AI agents to create posts, manage integrations, and retrieve content across multiple social media platforms.

## 🏗️ Architecture

### Core Components

- **PostizServer**: High-level MCP server using `@modelcontextprotocol/sdk`
- **HTTP Transport**: StreamableHTTPServerTransport for MCP-compliant HTTP communication
- **Tool Handlers**: Modular tools for Postiz API operations
- **API Client**: Axios-based client with comprehensive error handling

### MCP Tools Available

1. **create-post**: Create new social media posts
   - Content validation (minimum 6 characters)
   - Multiple platform support via integration_id
   - Post scheduling (draft, schedule, now)
   - Media attachment support
   - Short link generation

2. **get-integrations**: Retrieve connected social media accounts
   - Lists all active integrations
   - Platform-specific details
   - Authentication status

3. **get-posts**: Fetch existing posts
   - Pagination support (limit/offset)
   - Post status filtering
   - Historical data retrieval

## 🔧 Technical Implementation

### MCP Protocol Compliance

The server was upgraded from a basic Express HTTP implementation to full MCP specification compliance:

**Before (Non-compliant)**:
```javascript
app.post('/mcp', async (req, res) => {
    const response = await server.handleRequest(req.body);
    res.json(response);
});
```

**After (MCP Compliant)**:
```javascript
const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => randomUUID(),
    eventStore: new InMemoryEventStore(),
    onsessioninitialized: (sessionId) => {
        transports[sessionId] = transport;
    }
});
await server.connect(transport);
await transport.handleRequest(req, res, req.body);
```

### Session Management

- **UUID-based sessions**: Each MCP client gets a unique session
- **Event store recovery**: In-memory event store for session continuity
- **Transport lifecycle**: Proper session cleanup and connection handling

### Error Handling

- **MCP Error Codes**: Proper ErrorCode enum usage
- **Axios Interceptors**: Request/response logging and error transformation
- **API Validation**: Comprehensive parameter validation with Zod schemas

## 🚀 Deployment

### Docker Support

Multi-platform Docker images available:
- `ghcr.io/oculairmedia/postizz-mcp:latest`
- `ghcr.io/oculairmedia/postizz-mcp:master`

### Environment Variables

```bash
POSTIZ_API_URL=https://postiz.oculair.ca/api
POSTIZ_API_KEY=your_api_key_here
PORT=3084
NODE_ENV=production
```

### Transport Modes

```bash
# HTTP Transport (recommended for Letta)
node src/index.js --http

# STDIO Transport (for Claude Desktop)
node src/index.js --stdio

# SSE Transport
node src/index.js --sse
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflows

1. **ci.yml**: Comprehensive testing
   - Node.js 20.x and 22.x testing
   - Dependency validation
   - MCP server startup testing
   - Docker build verification

2. **docker-build.yml**: Automated deployment
   - Multi-platform builds (linux/amd64, linux/arm64)
   - GitHub Container Registry publishing
   - Layer caching for performance
   - Automated triggers on push to master

### Docker Compose

```yaml
services:
  postizmcp:
    image: ghcr.io/oculairmedia/postizz-mcp:latest
    ports:
      - 3084:3084
    environment:
      POSTIZ_API_URL: https://postiz.oculair.ca/api
      POSTIZ_API_KEY: ${POSTIZ_API_KEY}
      PORT: 3084
```

## 📋 Project Management & Development Workflow

### Huly Project Integration

This project is managed through **Huly Project Management System**:

- **Project Code**: `PSTZ` (Postiz MCP Project)
- **GitHub Integration**: Repository `oculairmedia/postizz-MCP` is connected to Huly
- **Issue Tracking**: All issues, enhancements, and bugs tracked in Huly
- **Documentation**: Comprehensive retrospective documentation available in Huly issues

### **IMPORTANT: Development Workflow Requirements**

⚠️ **MANDATORY PROCESS**: All changes to this project MUST follow this workflow:

1. **Create Huly Issue First**: Before making ANY changes, create an issue in the PSTZ project
2. **Document Requirements**: Clearly describe the change, problem, or enhancement
3. **Get Approval**: Ensure the issue is reviewed and approved before implementation
4. **Link Commits**: Reference the Huly issue ID in commit messages (e.g., "PSTZ-5: Fix tool validation")
5. **Update Issue Status**: Mark issues as in-progress, then done upon completion

**No code changes should be made without a corresponding Huly issue.**

### Huly Project Links

- **Project Dashboard**: Access through Huly interface → PSTZ project
- **Issue Creation**: Use Huly MCP tools or web interface
- **Status Tracking**: All work items tracked from conception to completion

## 🐛 Known Issues & Solutions

### MCP Protocol Compliance

**Issue**: Server not showing tools in Letta (strict MCP enforcement)
**Solution**: Upgraded to StreamableHTTPServerTransport with proper session management
**Huly Reference**: PSTZ-3 (Retrospective documentation)

### Package Dependencies

**Issue**: package-lock.json sync issues in CI
**Solution**: Updated package-lock.json after dependency upgrades

### Docker Image Signing

**Issue**: cosign/Fulcio intermittent failures
**Solution**: Removed signing step while maintaining image integrity

## 📚 Lessons Learned

1. **MCP Client Variations**: Different MCP clients (Letta vs MCP Jam) have varying protocol strictness
2. **SDK Best Practices**: Always use high-level SDK classes when available
3. **Reference Implementations**: Study working MCP servers for proven patterns
4. **Session Management**: Critical for HTTP transport reliability
5. **Testing Strategy**: Test with multiple MCP client implementations

## 🔗 Integration

### Letta Agent Integration

The server is designed to work seamlessly with Letta agents:

```javascript
// Letta can automatically discover and use tools
const tools = await mcpClient.listTools();
// Tools: create-post, get-integrations, get-posts
```

## 🚦 Health Monitoring

### Endpoints

- `GET /health`: Server health check
- `POST /mcp`: Main MCP protocol endpoint
- `GET /mcp`: SSE streaming endpoint (with session-id)

### Logging

Comprehensive logging includes:
- API request/response details
- MCP session lifecycle events
- Error conditions with stack traces
- Transport connection status

## 📖 Development Guidelines

### Before Starting Development

1. **Check Huly Project**: Review existing issues in PSTZ project
2. **Create New Issue**: Document what you plan to change/add
3. **Get Approval**: Ensure stakeholder review before proceeding
4. **Reference Issue**: Include PSTZ issue ID in all related commits

### Adding New Tools

1. **Create Huly Issue**: Document the new tool requirements
2. Create tool handler in `src/tools/`
3. Add Zod schema validation
4. Register in `PostizServer.setupTools()`
5. Add comprehensive error handling
6. Update this documentation
7. **Update Huly Issue**: Mark as complete with implementation details

### Testing

```bash
# Local development
npm install
npm start

# Docker testing
docker compose up -d
curl http://localhost:3084/health

# MCP protocol testing
# Use claude-mcp-inspector or similar tools
```

### Code Style

- ES6 modules with `.js` extensions
- Comprehensive error handling with MCP error codes
- Async/await pattern throughout
- Structured logging with context

## 🔍 Troubleshooting

### Common Issues

1. **API Connection Fails**
   - Check POSTIZ_API_URL and POSTIZ_API_KEY
   - Verify network connectivity
   - Check API endpoint availability
   - **Create Huly Issue**: If problem persists, document in PSTZ project

2. **MCP Tools Not Visible**
   - Ensure proper HTTP transport implementation
   - Verify MCP protocol version compatibility
   - Check session initialization
   - **Create Huly Issue**: For persistent protocol issues

3. **Docker Container Issues**
   - Verify environment variables
   - Check port availability (3084)
   - Review container logs for errors
   - **Create Huly Issue**: For infrastructure problems

### Debug Mode

Set environment variables for verbose logging:
```bash
DEBUG=postiz:*
LOG_LEVEL=debug
```

## 📞 Support & Contributions

### Getting Help

1. **Check Existing Issues**: Review PSTZ project in Huly for similar problems
2. **Create Support Issue**: Document your problem with reproduction steps
3. **Provide Context**: Include logs, environment details, and error messages

### Contributing

1. **Review Project Scope**: Check PSTZ project roadmap in Huly
2. **Create Feature Request**: Propose new features through Huly issues
3. **Follow Workflow**: All contributions must follow the Huly-first development process
4. **Documentation**: Update this CLAUDE.md file for significant changes

---

**Repository**: https://github.com/oculairmedia/postizz-MCP  
**Docker Images**: ghcr.io/oculairmedia/postizz-mcp  
**Stack Location**: /opt/stacks/postiz-mcp  
**Huly Project**: PSTZ (Postiz MCP Project)  
**Project Management**: 🔗 Huly-first development workflow MANDATORY