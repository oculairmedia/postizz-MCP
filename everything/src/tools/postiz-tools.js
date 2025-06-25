import { handleCreatePost, createPostToolDefinition } from './create-post.js';
import { handleGetIntegrations, getIntegrationsToolDefinition } from './get-integrations.js';
import { handleGetPosts, getPostsToolDefinition } from './get-posts.js';

// Export all tool definitions
export const postizToolDefinitions = [
    createPostToolDefinition,
    getIntegrationsToolDefinition,
    getPostsToolDefinition
];

// Export all tool handlers
export const postizToolHandlers = {
    [createPostToolDefinition.name]: handleCreatePost,
    [getIntegrationsToolDefinition.name]: handleGetIntegrations,
    [getPostsToolDefinition.name]: handleGetPosts
};