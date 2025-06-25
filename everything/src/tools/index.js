import { postizToolDefinitions, postizToolHandlers } from './postiz-tools.js';
import { CallToolRequestSchema, ListToolsRequestSchema, McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';

/**
 * Register all tool handlers with the server
 * @param {Object} server - The server instance
 */
export function registerToolHandlers(server) {
    // Register tool definitions
    server.server.setRequestHandler(ListToolsRequestSchema, async () => ({
        tools: postizToolDefinitions,
    }));

    // Register tool call handler
    server.server.setRequestHandler(CallToolRequestSchema, async (request) => {
        const handler = postizToolHandlers[request.params.name];
        
        if (handler) {
            // Pass the API instance to the tool handler
            return handler(server.apiInstance, request.params.arguments);
        } else {
            throw new McpError(
                ErrorCode.MethodNotFound,
                `Unknown tool: ${request.params.name}`
            );
        }
    });
}

// Export all tool definitions
export const toolDefinitions = postizToolDefinitions;

// Export all tool handlers
export const toolHandlers = postizToolHandlers;

/**
 * Returns a formatted list of all available tools with their descriptions
 * @returns {Array} Array of objects containing tool name and description
 */
export function getToolsList() {
    return toolDefinitions.map(tool => ({
        name: tool.name,
        description: tool.description
    }));
}

/**
 * Logs all available tools to the console
 */
export function showTools() {
    console.log('Available Tools:');
    console.log('===============');
    
    toolDefinitions.forEach(tool => {
        console.log(`- ${tool.name}: ${tool.description}`);
    });
}