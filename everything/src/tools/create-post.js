import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';

/**
 * Handler function for creating a new post via Postiz API
 * 
 * The Postiz API expects a specific structure for creating posts:
 * {
 *   type: 'draft' | 'schedule' | 'now',
 *   shortLink: boolean,
 *   date: ISO date string,
 *   tags: [],
 *   posts: [{
 *     integration: { id: string },
 *     value: [{ content: string, image: [] }],
 *     settings: { __type: provider_identifier }
 *   }]
 * }
 */
export async function handleCreatePost(api, args) {
    try {
        // Validate API instance
        if (!api) {
            throw new McpError(
                ErrorCode.InternalError,
                'API instance not initialized'
            );
        }
        
        // Destructure and validate arguments
        const { 
            content, 
            integration_id, 
            type = 'now', 
            date, 
            media_ids = [], 
            shortLink = false 
        } = args;
        
        if (!content || typeof content !== 'string') {
            throw new McpError(
                ErrorCode.InvalidParams,
                'Content parameter is required and must be a string'
            );
        }
        
        if (!integration_id) {
            throw new McpError(
                ErrorCode.InvalidParams,
                'integration_id is required. Use get-integrations to find available integration IDs.'
            );
        }
        
        if (!date) {
            throw new McpError(
                ErrorCode.InvalidParams,
                'date is required in ISO 8601 format (e.g., 2025-01-04T19:46:00.000Z)'
            );
        }
        
        if (!['draft', 'schedule', 'now'].includes(type)) {
            throw new McpError(
                ErrorCode.InvalidParams,
                'type must be one of: "draft", "schedule", "now"'
            );
        }

        // First, get the integration details to find the provider identifier
        let providerIdentifier;
        try {
            const integrationsResponse = await api.get('/public/v1/integrations');
            const integrations = integrationsResponse.data;
            const integration = integrations.find(i => i.id === integration_id);
            
            if (!integration) {
                throw new McpError(
                    ErrorCode.InvalidParams,
                    `Integration with ID ${integration_id} not found. Use get-integrations to see available integrations.`
                );
            }
            
            providerIdentifier = integration.identifier;
        } catch (error) {
            if (error instanceof McpError) throw error;
            throw new McpError(
                ErrorCode.InternalError,
                `Failed to fetch integration details: ${error.message}`
            );
        }

        // Build the media/image array from media_ids
        const imageArray = media_ids.map(id => ({ id }));

        // Build the request payload in the format expected by Postiz API
        const requestData = {
            type,
            shortLink,
            date,
            tags: [],
            posts: [{
                integration: { id: integration_id },
                value: [{
                    content,
                    image: imageArray
                }],
                settings: {
                    __type: providerIdentifier
                }
            }]
        };
        
        console.error('Creating post with payload:', JSON.stringify(requestData, null, 2));
        
        // Make API request
        const response = await api.post('/public/v1/posts', requestData);

        // Check for error response
        if (response.status >= 400) {
            throw new McpError(
                ErrorCode.InternalError,
                `API error (${response.status}): ${JSON.stringify(response.data)}`
            );
        }

        return {
            content: [{
                type: 'text',
                text: JSON.stringify({
                    success: true,
                    message: 'Post created successfully',
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
            const message = error.response.data?.message || error.response.data?.msg || error.message;
            
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
            } else if (status === 429) {
                throw new McpError(
                    ErrorCode.InternalError,
                    'Rate limit exceeded. Please try again later.'
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
            `Failed to create post: ${error.message}`
        );
    }
}

/**
 * Tool definition for create_post
 */
export const createPostToolDefinition = {
    name: 'create_post',
    description: 'Create a new social media post on Postiz platform',
    inputSchema: {
        type: 'object',
        properties: {
            content: {
                type: 'string',
                description: 'Text content of the post'
            },
            integration_id: {
                type: 'string', 
                description: 'Integration ID for the target platform (use get-integrations to find available IDs)'
            },
            type: {
                type: 'string',
                description: 'Type of post: "draft", "schedule", or "now"',
                enum: ['draft', 'schedule', 'now'],
                default: 'now'
            },
            date: {
                type: 'string',
                description: 'Publish date in ISO 8601 format (e.g., "2025-01-04T19:46:00.000Z")'
            },
            media_ids: {
                type: 'array',
                items: {
                    type: 'string'
                },
                description: 'Array of media IDs (from uploaded media)',
                default: []
            },
            shortLink: {
                type: 'boolean',
                description: 'Whether to create short links',
                default: false
            }
        },
        required: ['content', 'integration_id', 'date']
    }
};
