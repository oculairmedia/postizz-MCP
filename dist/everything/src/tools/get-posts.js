import axios from 'axios';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
/**
 * Handler function for getting posts from Postizz API
 */
export async function handleGetPosts(server, args) {
    try {
        // Destructure and validate arguments with defaults
        const { display = "month", year = 2025, month = 1, week = 1, day = 1, newest_first = true } = args;
        // Validate display parameter
        if (!["month", "week", "day"].includes(display)) {
            throw new McpError(ErrorCode.InvalidParams, 'display must be one of: "month", "week", "day"');
        }
        const API_URL = "https://postiz.oculair.ca/api/public/v1/posts";
        const headers = {
            "Authorization": "255364482e25a51ff9a6660135b8c88995e7ae68615fb9a67ad14d601f8fe0ff",
            "Content-Type": "application/json"
        };
        // Build query parameters
        const params = {
            display,
            year,
            month,
            week,
            day,
            sort: newest_first ? "desc" : "asc"
        };
        // Make request to Postizz API
        const response = await axios.get(API_URL, { headers, params });
        return {
            content: [{
                    type: 'text',
                    text: JSON.stringify(response.data, null, 2)
                }]
        };
    }
    catch (error) {
        let errorMessage = 'Failed to get posts: ';
        if (axios.isAxiosError(error)) {
            errorMessage += error.response?.data?.message || error.message;
            if (error.response) {
                errorMessage += `\nStatus: ${error.response.status}`;
                errorMessage += `\nResponse: ${JSON.stringify(error.response.data)}`;
            }
        }
        else {
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
 * Tool definition for get_posts
 */
export const getPostsToolDefinition = {
    name: 'get_posts',
    description: 'Get list of posts from Postizz API with date filtering',
    inputSchema: {
        type: 'object',
        properties: {
            display: {
                type: 'string',
                description: 'Display mode ("month", "week", "day")',
                default: 'month'
            },
            year: {
                type: 'integer',
                description: 'Filter by year',
                default: 2025
            },
            month: {
                type: 'integer',
                description: 'Filter by month (1-12)',
                default: 1
            },
            week: {
                type: 'integer',
                description: 'Filter by week (1-52)',
                default: 1
            },
            day: {
                type: 'integer',
                description: 'Filter by day (1-31)',
                default: 1
            },
            newest_first: {
                type: 'boolean',
                description: 'Sort posts by date (true=newest first, false=oldest first)',
                default: true
            }
        },
        required: []
    }
};
