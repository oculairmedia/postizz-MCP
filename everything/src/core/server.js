#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import axios from 'axios';

/**
 * Core server class that handles initialization and API communication
 */
export class PostizServer {
    /**
     * Initialize the MCP server
     */
    constructor() {
        // Use high-level McpServer for better compliance
        this.server = new McpServer({
            name: 'postiz-server',
            version: '1.0.0',
        });

        // Initialize API configuration
        this.baseUrl = process.env.POSTIZ_API_URL || 'https://postiz.oculair.ca/api';
        this.apiKey = process.env.POSTIZ_API_KEY;

        // Log API configuration for debugging
        console.error('API Configuration:');
        console.error('Base URL:', this.baseUrl);
        console.error('API Key:', this.apiKey ? 'Available' : 'Not available');
        
        if (!this.apiKey) {
            console.error('Warning: POSTIZ_API_KEY environment variable not set');
        }

        this.apiInstance = null;
        this.setupTools();
    }

    setupTools() {
        // Register create-post tool
        this.server.tool(
            'create-post',
            'Create a new social media post via Postiz API',
            {
                content: z.string().min(1).describe('Post content text'),
                integration_id: z.string().describe('Integration ID for the target platform (use get-integrations to find available IDs)'),
                type: z.enum(['draft', 'schedule', 'now']).default('now').describe('Post type: draft, schedule, or now'),
                date: z.string().describe('Publish date in ISO 8601 format (e.g., 2025-01-04T19:46:00.000Z)'),
                media_ids: z.array(z.string()).default([]).describe('Array of media IDs (from uploaded media)'),
                shortLink: z.boolean().default(false).describe('Whether to use short links')
            },
            async (args) => {
                const { handleCreatePost } = await import('../tools/create-post.js');
                return handleCreatePost(this.apiInstance, args);
            }
        );
        
        // Register get-integrations tool
        this.server.tool(
            'get-integrations',
            'Get list of connected social media integrations',
            {},
            async (args) => {
                const { handleGetIntegrations } = await import('../tools/get-integrations.js');
                return handleGetIntegrations(this.apiInstance, args);
            }
        );
        
        // Register get-posts tool
        this.server.tool(
            'get-posts',
            'Get list of posts from Postiz within a date range',
            {
                startDate: z.string().describe('Start date in ISO 8601 format (e.g., 2025-01-01T00:00:00.000Z)'),
                endDate: z.string().describe('End date in ISO 8601 format (e.g., 2025-12-31T23:59:59.000Z)'),
                customer: z.string().optional().describe('Optional customer filter')
            },
            async (args) => {
                const { handleGetPosts } = await import('../tools/get-posts.js');
                return handleGetPosts(this.apiInstance, args);
            }
        );
    }

    async initializeAPI() {
        const apiUrl = this.baseUrl;
        const apiKey = this.apiKey;
        
        if (!apiUrl) {
            throw new Error('POSTIZ_API_URL environment variable is required');
        }
        
        if (!apiKey) {
            throw new Error('POSTIZ_API_KEY environment variable is required');
        }
        
        // Create axios instance with proper configuration
        // Note: Postiz API expects the API key directly in the Authorization header (no Bearer prefix)
        this.apiInstance = axios.create({
            baseURL: apiUrl,
            headers: {
                'Authorization': apiKey,
                'Content-Type': 'application/json',
                'User-Agent': 'Postiz-MCP-Server/1.0.0'
            },
            timeout: 30000, // 30 second timeout
            validateStatus: (status) => status < 500 // Don't throw on 4xx errors
        });
        
        // Add request interceptor for logging
        this.apiInstance.interceptors.request.use(
            (config) => {
                console.error(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
                return config;
            },
            (error) => {
                console.error('API Request Error:', error);
                return Promise.reject(error);
            }
        );
        
        // Add response interceptor for logging
        this.apiInstance.interceptors.response.use(
            (response) => {
                console.error(`API Response: ${response.status} ${response.config.url}`);
                return response;
            },
            (error) => {
                console.error('API Response Error:', error.response?.status, error.response?.data);
                return Promise.reject(error);
            }
        );
        
        // Test API connection
        try {
            await this.testAPIConnection();
            console.error('API connection test successful');
        } catch (error) {
            console.error('API connection test failed:', error.message);
            throw new Error(`Failed to connect to Postiz API: ${error.message}`);
        }
    }
    
    async testAPIConnection() {
        try {
            // Test with a simple API call
            const response = await this.apiInstance.get('/public/v1/integrations');
            return response.data;
        } catch (error) {
            if (error.response?.status === 401) {
                throw new Error('Invalid API key');
            } else if (error.response?.status === 404) {
                throw new Error('API endpoint not found - check POSTIZ_API_URL');
            } else {
                throw error;
            }
        }
    }
    
    async connect(transport) {
        await this.server.connect(transport);
    }
    
    async close() {
        await this.server.close();
    }
    
    async handleRequest(request) {
        // Simple request handler for HTTP transport
        return {
            jsonrpc: '2.0',
            result: { message: 'Request received' },
            id: request.id
        };
    }
}