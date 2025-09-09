import axios from 'axios';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';

/**
 * Handler function for getting list of integrations from Postiz API
 */
export async function handleGetIntegrations(api, args) {
    try {
        // Validate API instance
        if (!api) {
            throw new McpError(
                ErrorCode.InternalError,
                'API instance not initialized'
            );
        }

        // Make API request
        const response = await api.get('/public/v1/integrations');

        return {
            content: [{
                type: 'text',
                text: JSON.stringify({
                    success: true,
                    message: 'Integrations retrieved successfully',
                    data: response.data
                }, null, 2)
            }]
        };
    } catch (error) {
        // Handle different error types
        if (error instanceof McpError) {
            throw error; // Re-throw MCP errors as-is
        }
        
        if (error.response) {
            // API error response
            const status = error.response.status;
            const message = error.response.data?.message || error.message;
            
            if (status === 401) {
                throw new McpError(
                    ErrorCode.InvalidParams,
                    'Authentication failed. Please check your API key.'
                );
            } else if (status === 403) {
                throw new McpError(
                    ErrorCode.InvalidParams,
                    'Access forbidden. Check your permissions.'
                );
            } else {
                throw new McpError(
                    ErrorCode.InternalError,
                    `API error (${status}): ${message}`
                );
            }
        }
        
        // Network or other errors
        throw new McpError(
            ErrorCode.InternalError,
            `Failed to get integrations: ${error.message}`
        );
    }
}

/**
 * Tool definition for get_integrations
 */
export const getIntegrationsToolDefinition = {
    name: 'get_integrations',
    description: 'Get all connected social media accounts and integrations configured in your Postiz workspace',
    inputSchema: {
        type: 'object',
        properties: {},
        required: []
    }
};