import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';

/**
 * Handler function for creating a new post via Postiz API
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
        
        // Validate required arguments with detailed messages
        const { content, integration_id, post_type = 'now', publish_date, media_urls = [], short_link = false } = args;
        
        if (!content || typeof content !== 'string') {
            throw new McpError(
                ErrorCode.InvalidParams,
                'Content parameter is required and must be a string'
            );
        }
        
        if (content.length < 6) {
            throw new McpError(
                ErrorCode.InvalidParams,
                'Content must be at least 6 characters long'
            );
        }
        
        if (!['draft', 'schedule', 'now'].includes(post_type)) {
            throw new McpError(
                ErrorCode.InvalidParams,
                'post_type must be one of: "draft", "schedule", "now"'
            );
        }
        
        if (post_type === 'schedule' && !publish_date) {
            throw new McpError(
                ErrorCode.InvalidParams,
                'publish_date is required when post_type is "schedule"'
            );
        }
        
        // Validate media URLs
        if (media_urls && Array.isArray(media_urls)) {
            for (const url of media_urls) {
                try {
                    new URL(url);
                } catch {
                    throw new McpError(
                        ErrorCode.InvalidParams,
                        `Invalid media URL: ${url}`
                    );
                }
            }
        }

        // Prepare request data
        const requestData = {
            content,
            post_type,
            short_link
        };
        
        if (integration_id) {
            requestData.integration_id = integration_id;
        }
        
        if (publish_date) {
            requestData.publish_date = publish_date;
        }
        
        if (media_urls.length > 0) {
            requestData.media_urls = media_urls;
        }
        
        // Make API request with proper error handling
        const response = await api.post('/public/v1/posts', requestData);

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
    description: 'Create a new social media post on Postiz platform with optional media attachments and scheduling',
    inputSchema: {
        type: 'object',
        properties: {
            content: {
                type: 'string',
                description: 'Text content of the post (minimum 6 characters)'
            },
            integration_id: {
                type: 'string', 
                description: 'Integration ID to post to'
            },
            post_type: {
                type: 'string',
                description: 'Type of post ("draft", "schedule", or "now")',
                default: 'now'
            },
            publish_date: {
                type: 'string',
                description: 'Optional ISO format date (e.g. "2025-01-04T19:46:00.000Z")'
            },
            media_urls: {
                type: 'array',
                items: {
                    type: 'string'
                },
                description: 'Optional list of media URLs to attach'
            },
            short_link: {
                type: 'boolean',
                description: 'Whether to create a short link',
                default: false
            }
        },
        required: ['content', 'integration_id', 'publish_date']
    }
};