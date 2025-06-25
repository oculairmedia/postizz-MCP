import { ghostToolDefinitions, ghostToolHandlers } from './ghost-tools.js';
import { postizToolDefinitions, postizToolHandlers } from './postiz-tools.js';
import { CallToolRequestSchema, ListToolsRequestSchema, McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
/**
 * Register all tool handlers with the server
 * @param {Object} server - The server instance
 */
export function registerToolHandlers(server) {
    // Combine all tool definitions
    const allToolDefinitions = [
        ...ghostToolDefinitions,
        ...postizToolDefinitions
    ];
    // Combine all tool handlers
    const allToolHandlers = {
        ...ghostToolHandlers,
        ...postizToolHandlers
    };
    // Register tool definitions
    server.server.setRequestHandler(ListToolsRequestSchema, async () => ({
        tools: allToolDefinitions,
    }));
    // Register tool call handler
    server.server.setRequestHandler(CallToolRequestSchema, async (request) => {
        const handler = allToolHandlers[request.params.name];
        if (handler) {
            return handler(server, request.params.arguments);
        }
        else {
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
        }
    });
}
// Export all tool definitions
export const toolDefinitions = [
    ...ghostToolDefinitions,
    ...postizToolDefinitions
];
// Export all tool handlers
export const toolHandlers = {
    ...ghostToolHandlers,
    ...postizToolHandlers
};
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
