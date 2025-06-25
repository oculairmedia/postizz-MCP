import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';

/**
 * Handler function for creating a new post via Postiz API
 */
export async function handleCreatePost(api, args) {
    try {
        // Destructure and validate required arguments
        const { 
            content,
            integration_id,
            post_type = "now",
            publish_date,
            media_urls = [],
            short_link = false
        } = args;

        // Validate content
        if (!content || typeof content !== 'string' || content.length < 6) {
            throw new McpError(
                ErrorCode.InvalidParams,
                "Content must be at least 6 characters long"
            );
        }

        // Validate post_type
        if (!["draft", "schedule", "now"].includes(post_type)) {
            throw new McpError(
                ErrorCode.InvalidParams,
                'post_type must be one of: "draft", "schedule", "now"'
            );
        }

        // Validate publish_date
        if (!publish_date || typeof publish_date !== 'string') {
            throw new McpError(
                ErrorCode.InvalidParams,
                'publish_date is required and must be a string'
            );
        }

        const API_URL = "https://postiz.oculair.ca/api/public/v1/posts";
        const headers = {
            "Authorization": api.defaults.headers.Authorization,
            "Content-Type": "application/json"
        };

        // Build post value array
        const value = [{ content }];
        if (media_urls && Array.isArray(media_urls)) {
            for (const url of media_urls) {
                value.push({ media: url });
            }
        }

        const postData = {
            type: post_type,
            shortLink: short_link,
            date: publish_date,
            posts: [{
                integration: { id: integration_id },
                value
            }]
        };

        // Make request to Postiz API
        const response = await api.post(API_URL, postData, { headers });

        return {
            content: [{
                type: 'text',
                text: JSON.stringify(response.data, null, 2)
            }]
        };
    } catch (error) {
        let errorMessage = 'Failed to create post: ';
        
        if (axios.isAxiosError(error)) {
            errorMessage += error.response?.data?.message || error.message;
            if (error.response) {
                errorMessage += `\nStatus: ${error.response.status}`;
                errorMessage += `\nResponse Body: ${JSON.stringify(error.response.data)}`;
            }
        } else {
            errorMessage += error.message;
        }

        return {
            content: [{
                type: 'text',
                text: errorMessage
            }],
            isError: true
        };
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