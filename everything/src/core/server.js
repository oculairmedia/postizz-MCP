#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';

/**
 * Core server class that handles initialization and API communication
 */
export class PostizServer {
    /**
     * Initialize the MCP server
     */
    constructor() {
        // Initialize MCP server
        this.server = new Server({
            name: 'postiz-server',
            version: '1.0.0',
        }, {
            capabilities: {
                tools: {},
            },
        });

        // Set up error handler
        this.server.onerror = (error) => console.error('[MCP Error]', error);

        // Initialize API configuration
        this.baseUrl = process.env.POSTIZ_API_URL || 'https://postiz.oculair.ca/api';
        this.apiKey = process.env.POSTIZ_API_KEY;

        // Log API configuration for debugging
        console.log('API Configuration:');
        console.log('Base URL:', this.baseUrl);
        console.log('API Key:', this.apiKey ? 'Available' : 'Not available');
        
        if (!this.apiKey) {
            console.warn('Warning: POSTIZ_API_KEY environment variable not set');
        }
        
        // Initialize axios instance for API requests
        this.api = axios.create({
            baseURL: this.baseUrl,
            headers: {
                'Authorization': this.apiKey,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        });

        // Make API instance available to tools
        this.apiInstance = this.api;
    }

    /**
     * Get API headers with authentication
     * @returns {Object} Headers object
     */
    getApiHeaders() {
        return {
            'Authorization': this.apiKey,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };
    }

    /**
     * Create a standard error response
     * @param {Error} error - The error object
     * @returns {Object} Formatted error response
     */
    createErrorResponse(error) {
        console.error('Error in tool handler:', error);
        return {
            content: [{
                type: 'text',
                text: JSON.stringify({
                    success: false,
                    error: error.message,
                    details: error.response?.data || error,
                }, null, 2),
            }],
            isError: true,
        };
    }
}