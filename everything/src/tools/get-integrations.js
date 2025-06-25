import axios from 'axios';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';

/**
 * Handler function for getting list of integrations from Postizz API
 */
export async function handleGetIntegrations(api, args) {
    try {
        const API_URL = "https://postiz.oculair.ca/api/public/v1/integrations";
        const headers = {
            "Authorization": api.defaults.headers.Authorization,
            "Content-Type": "application/json"
        };

        console.log('Making request to:', API_URL);
        console.log('Headers:', JSON.stringify(headers, null, 2));

        // Make request to Postizz API
        const response = await axios.get(API_URL, { headers });

        return {
            content: [{
                type: 'text',
                text: JSON.stringify(response.data, null, 2)
            }]
        };
    } catch (error) {
        let errorMessage = 'Failed to get integrations: ';
        
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
 * Tool definition for get_integrations
 */
export const getIntegrationsToolDefinition = {
    name: 'get_integrations',
    description: 'Get list of integrations from Postizz API',
    inputSchema: {
        type: 'object',
        properties: {},
        required: []
    }
};