#!/usr/bin/env node
import dotenv from 'dotenv';
import { PostizServer } from './core/server.js';
import { registerToolHandlers } from './tools/index.js';
import { runStdio, runSSE, runHTTP } from './transports/index.js';

// Load environment variables
dotenv.config();

/**
 * Initialize and run the Postiz MCP server
 */
async function main() {
    try {
        // Create server instance
        const server = new PostizServer();
        
        // Register all tool handlers
        registerToolHandlers(server);
        
        // Determine transport mode from command line arguments
        const useSSE = process.argv.includes('--sse');
        const useHTTP = process.argv.includes('--http');
        
        // Run server with appropriate transport
        if (useHTTP) {
            console.log('Starting Postiz server with HTTP transport');
            await runHTTP(server);
        } else if (useSSE) {
            console.log('Starting Postiz server with SSE transport');
            await runSSE(server);
        } else {
            console.log('Starting Postiz server with stdio transport');
            await runStdio(server);
        }
    } catch (error) {
        console.error('Failed to start Postiz server:', error);
        process.exit(1);
    }
}

// Run the server
main().catch(console.error);