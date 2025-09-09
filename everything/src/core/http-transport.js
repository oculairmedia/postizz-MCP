import express from 'express';
import cors from 'cors';
import { randomUUID } from 'crypto';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';

/**
 * Simple in-memory event store for MCP session recovery
 */
class InMemoryEventStore {
    constructor() {
        this.events = new Map();
    }

    generateEventId(streamId) {
        return `${streamId}_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    }

    getStreamIdFromEventId(eventId) {
        const parts = eventId.split('_');
        return parts.length > 0 ? parts[0] : '';
    }

    async storeEvent(streamId, message) {
        const eventId = this.generateEventId(streamId);
        this.events.set(eventId, { streamId, message });
        return eventId;
    }

    async replayEventsAfter(lastEventId, { send }) {
        if (!lastEventId || !this.events.has(lastEventId)) {
            return '';
        }

        const streamId = this.getStreamIdFromEventId(lastEventId);
        if (!streamId) {
            return '';
        }

        let foundLastEvent = false;
        const sortedEvents = [...this.events.entries()].sort((a, b) => a[0].localeCompare(b[0]));

        for (const [eventId, { streamId: eventStreamId, message }] of sortedEvents) {
            if (eventStreamId !== streamId) {
                continue;
            }

            if (eventId === lastEventId) {
                foundLastEvent = true;
                continue;
            }

            if (foundLastEvent) {
                await send(eventId, message);
            }
        }
        return streamId;
    }
}

/**
 * Run the Postiz MCP server using HTTP streaming transport
 */
export async function runHTTP(server, port = 3084) {
    const app = express();
    const transports = {};

    // CORS configuration
    app.use(cors({
        origin: [
            'http://localhost',
            'http://127.0.0.1', 
            'http://192.168.50.90',
            'https://letta.oculair.ca',
            'https://letta2.oculair.ca'
        ],
        credentials: true
    }));

    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true }));

    // Request logging
    app.use((req, res, next) => {
        console.log(`${req.method} ${req.path} - ${req.ip}`);
        next();
    });

    // Health endpoint
    app.get('/health', (req, res) => {
        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString()
        });
    });

    // Main MCP endpoint - POST
    app.post('/mcp', async (req, res) => {
        console.log('Received MCP request:', req.body);
        try {
            const sessionId = req.headers['mcp-session-id'];
            let transport;

            if (sessionId && transports[sessionId]) {
                // Reuse existing transport
                transport = transports[sessionId];
            } else if (!sessionId && isInitializeRequest(req.body)) {
                // New initialization request
                const eventStore = new InMemoryEventStore();
                transport = new StreamableHTTPServerTransport({
                    sessionIdGenerator: () => randomUUID(),
                    eventStore,
                    onsessioninitialized: (sessionId) => {
                        console.log(`Session initialized with ID: ${sessionId}`);
                        transports[sessionId] = transport;
                    },
                });

                transport.onclose = () => {
                    const sid = transport.sessionId;
                    if (sid && transports[sid]) {
                        console.log(`Transport closed for session ${sid}`);
                        delete transports[sid];
                    }
                };

                // Connect transport to MCP server
                await server.connect(transport);
                await transport.handleRequest(req, res, req.body);
                return;
            } else {
                // Invalid request
                res.status(400).json({
                    jsonrpc: '2.0',
                    error: {
                        code: -32000,
                        message: 'Bad Request: No valid session ID provided',
                    },
                    id: null,
                });
                return;
            }

            // Handle request with existing transport
            await transport.handleRequest(req, res, req.body);
        } catch (error) {
            console.error('Error handling MCP request:', error);
            if (!res.headersSent) {
                res.status(500).json({
                    jsonrpc: '2.0',
                    error: {
                        code: -32603,
                        message: 'Internal server error',
                    },
                    id: null,
                });
            }
        }
    });

    // MCP endpoint - GET (for SSE streaming)
    app.get('/mcp', async (req, res) => {
        const sessionId = req.headers['mcp-session-id'];

        if (!sessionId || !transports[sessionId]) {
            return res.status(400).send('Session ID required');
        }

        const transport = transports[sessionId];
        await transport.handleRequest(req, res);
    });

    // Start server
    app.listen(port, () => {
        console.log(`HTTP server listening on port ${port}`);
        console.log(`Health check: http://localhost:${port}/health`);
        console.log(`MCP endpoint: http://localhost:${port}/mcp`);
    });
}