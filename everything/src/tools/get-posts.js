import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';

/**
 * Handler function for getting posts from Postiz API
 */
export async function handleGetPosts(api, args) {
    try {
        // Validate API instance
        if (!api) {
            throw new McpError(
                ErrorCode.InternalError,
                'API instance not initialized'
            );
        }
        
        // Destructure arguments
        const { limit, offset } = args;
        
        // Build query parameters
        const params = {};
        if (limit) {
            params.limit = limit;
        }
        if (offset) {
            params.offset = offset;
        }

        // Make API request  
        const response = await api.get('/public/v1/posts', { params });

        return {
            content: [{
                type: 'text',
                text: JSON.stringify({
                    success: true,
                    message: 'Posts retrieved successfully',
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
            `Failed to get posts: ${error.message}`
        );
    }
}

/**
 * Tool definition for get_posts
 */
export const getPostsToolDefinition = {
    name: 'get_posts',
    description: 'Retrieve posts from Postiz with optional pagination',
    inputSchema: {
        type: 'object',
        properties: {
            limit: {
                type: 'integer',
                description: 'Number of posts to retrieve',
                minimum: 1
            },
            offset: {
                type: 'integer',
                description: 'Number of posts to skip (for pagination)',
                minimum: 0
            }
        },
        required: []
    }
};