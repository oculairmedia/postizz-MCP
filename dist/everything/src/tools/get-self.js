import axios from 'axios';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
/**
 * Handler function for getting current user info from Postizz API
 */
export async function handleGetSelf(server, args) {
    try {
        const API_URL = "https://postiz.oculair.ca/api/user/self";
        const headers = {
            "Authorization": "255364482e25a51ff9a6660135b8c88995e7ae68615fb9a67ad14d601f8fe0ff",
            "Content-Type": "application/json"
        };
        // Make request to Postizz API
        const response = await axios.get(API_URL, { headers });
        return {
            content: [{
                    type: 'text',
                    text: JSON.stringify(response.data, null, 2)
                }]
        };
    }
    catch (error) {
        let errorMessage = 'Failed to get user info: ';
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
 * Tool definition for get_self
 */
export const getSelfToolDefinition = {
    name: 'get_self',
    description: 'Get current user information from Postizz API',
    inputSchema: {
        type: 'object',
        properties: {},
        required: []
    }
};
