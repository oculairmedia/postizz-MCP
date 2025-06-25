import axios from 'axios';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';

/**
 * Handler function for logging in to Postizz API
 */
export async function handleLogin(server, args) {
    try {
        // Validate required arguments
        const { email, password } = args;

        if (!email || typeof email !== 'string') {
            throw new McpError(
                ErrorCode.InvalidParams,
                'Email is required and must be a string'
            );
        }

        if (!password || typeof password !== 'string') {
            throw new McpError(
                ErrorCode.InvalidParams,
                'Password is required and must be a string'
            );
        }

        const API_URL = "https://postiz.oculair.ca/api/auth/login";
        const headers = {
            "Content-Type": "application/json"
        };

        const loginData = {
            email,
            password
        };

        // Make request to Postizz API
        const response = await axios.post(API_URL, loginData, { headers });

        return {
            content: [{
                type: 'text',
                text: JSON.stringify(response.data, null, 2)
            }]
        };
    } catch (error) {
        let errorMessage = 'Login failed: ';
        
        if (axios.isAxiosError(error)) {
            errorMessage += error.response?.data?.message || error.message;
            if (error.response) {
                errorMessage += `\nStatus: ${error.response.status}`;
                errorMessage += `\nResponse: ${JSON.stringify(error.response.data)}`;
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
 * Tool definition for login
 */
export const loginToolDefinition = {
    name: 'login',
    description: 'Login to Postizz API and get auth token',
    inputSchema: {
        type: 'object',
        properties: {
            email: {
                type: 'string',
                description: 'User email'
            },
            password: {
                type: 'string',
                description: 'User password'
            }
        },
        required: ['email', 'password']
    }
};