#!/usr/bin/env node
import dotenv from 'dotenv';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import express from 'express';
import cors from 'cors';
import { PostizServer } from './core/server.js';

// Load environment variables
dotenv.config();

async function main() {
    try {
        // Create server instance
        const server = new PostizServer();
        
        // Initialize API
        await server.initializeAPI();
        
        // Determine transport from command line
        const args = process.argv.slice(2);
        const transport = args.find(arg => ['--stdio', '--sse', '--http'].includes(arg)) || '--stdio';
        
        switch (transport) {
            case '--stdio':
                console.error('Starting Postiz MCP server with stdio transport...');
                const stdioTransport = new StdioServerTransport();
                await server.connect(stdioTransport);
                break;
                
            case '--sse':
                console.error('Starting Postiz MCP server with SSE transport...');
                await startSSEServer(server);
                break;
                
            case '--http':
                console.error('Starting Postiz MCP server with HTTP transport...');
                await startHTTPServer(server);
                break;
                
            default:
                throw new Error(`Unknown transport: ${transport}`);
        }
        
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

async function startSSEServer(server) {
    const app = express();
    const port = process.env.PORT || 3084;
    
    app.use(cors());
    app.use(express.json());
    
    // Health check endpoint
    app.get('/health', (req, res) => {
        res.json({ status: 'healthy', timestamp: new Date().toISOString() });
    });
    
    // SSE endpoint
    app.get('/sse', async (req, res) => {
        const transport = new SSEServerTransport('/message', res);
        await server.connect(transport);
    });
    
    // Message endpoint for SSE
    app.post('/message', async (req, res) => {
        // Handle incoming messages for SSE transport
        res.json({ received: true });
    });
    
    app.listen(port, () => {
        console.error(`SSE server listening on port ${port}`);
        console.error(`Health check: http://localhost:${port}/health`);
        console.error(`SSE endpoint: http://localhost:${port}/sse`);
    });
}

async function startHTTPServer(server) {
    const { runHTTP } = await import('./core/http-transport.js');
    const port = process.env.PORT || 3084;
    await runHTTP(server, port);
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.error('Received SIGINT, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.error('Received SIGTERM, shutting down gracefully...');
    process.exit(0);
});

if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}