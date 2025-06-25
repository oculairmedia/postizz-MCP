import axios from 'axios';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';

/**
 * Handler function for getting posts from Postiz API
 */
export async function handleGetPosts(api, args) {
    try {
        // Destructure and validate arguments with defaults
        const {
            display = "month",
            year,
            month,
            week = 1,  // Default to week 1 to prevent API errors
            day = 1    // Default to day 1 to prevent API errors
        } = args;

        // Validate display parameter
        if (!["day", "week", "month"].includes(display)) {
            throw new McpError(
                ErrorCode.InvalidParams,
                'display must be one of: "day", "week", "month"'
            );
        }

        // Validate year
        if (!year || year < 2022) {
            throw new McpError(
                ErrorCode.InvalidParams,
                'year is required and must be 2022 or later'
            );
        }

        // Validate day
        if (display === "day" && (day === undefined || day < 0 || day > 6)) {
            throw new McpError(
                ErrorCode.InvalidParams,
                'day is required for daily view and must be between 0-6'
            );
        }

        // Validate week
        if ((display === "week" || display === "day") && (week === undefined || week < 1 || week > 52)) {
            throw new McpError(
                ErrorCode.InvalidParams,
                'week is required for weekly/daily view and must be between 1-52'
            );
        }

        // Validate month
        if ((display === "month" || display === "week") && (month === undefined || month < 1 || month > 12)) {
            throw new McpError(
                ErrorCode.InvalidParams,
                'month is required for monthly/weekly view and must be between 1-12'
            );
        }

        const API_URL = "https://postiz.oculair.ca/api/public/v1/posts";
        const headers = {
            "Authorization": api.defaults.headers.Authorization,
            "Content-Type": "application/json"
        };

        // Build query parameters
        const params = {
            display,
            year,
            ...(month !== undefined && { month }),
            week,  // Always include week (now has default value)
            day    // Always include day (now has default value)
        };

        console.log('Making request to:', API_URL);
        console.log('Headers:', JSON.stringify(headers, null, 2));
        console.log('Params:', JSON.stringify(params, null, 2));

        // Make request to Postiz API
        const response = await axios.get(API_URL, { headers, params });

        return {
            content: [{
                type: 'text',
                text: JSON.stringify(response.data, null, 2)
            }]
        };
    } catch (error) {
        let errorMessage = 'Failed to get posts: ';

        if (axios.isAxiosError(error)) {
            errorMessage += error.response?.data?.message || error.message;
            if (error.response) {
                errorMessage += `\nResponse Status: ${error.response.status}`;
                errorMessage += `\nResponse Body: ${JSON.stringify(error.response.data)}`;
            }
            errorMessage += `\nRequest URL: ${error.config?.url}`;
            errorMessage += `\nRequest Headers: ${JSON.stringify(error.config?.headers)}`;
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
 * Tool definition for get_posts
 */
export const getPostsToolDefinition = {
    name: 'get_posts',
    description: 'Retrieve scheduled and published posts from Postiz with flexible date filtering (daily, weekly, or monthly view)',
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
                description: 'Year (2022 or later)',
                minimum: 2022
            },
            month: {
                type: 'integer',
                description: 'Month number (1-12), required for monthly/weekly view',
                minimum: 1,
                maximum: 12
            },
            week: {
                type: 'integer',
                description: 'Week number (1-52), required for weekly/daily view',
                minimum: 1,
                maximum: 52
            },
            day: {
                type: 'integer',
                description: 'Day of week (0-6), required for daily view',
                minimum: 0,
                maximum: 6
            }
        },
        required: ['year']
    }
};