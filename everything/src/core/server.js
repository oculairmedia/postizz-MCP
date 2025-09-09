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
                content: z.string().min(6).describe('Post content (minimum 6 characters)'),
                integration_id: z.string().optional().describe('Integration ID for specific platform'),
                post_type: z.enum(['draft', 'schedule', 'now']).default('now').describe('Post type'),
                publish_date: z.string().optional().describe('Publish date for scheduled posts'),
                media_urls: z.array(z.string()).default([]).describe('Array of media URLs'),
                short_link: z.boolean().default(false).describe('Whether to use short links')
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
            'Get list of posts from Postiz',
            {
                limit: z.number().optional().describe('Number of posts to retrieve'),
                offset: z.number().optional().describe('Offset for pagination')
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
        this.apiInstance = axios.create({
            baseURL: apiUrl,
            headers: {
                'Authorization': `Bearer ${apiKey}`,
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