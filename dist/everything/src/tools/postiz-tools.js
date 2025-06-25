import { handleCreatePost, createPostToolDefinition } from './create-post.js';
import { handleGetIntegrations, getIntegrationsToolDefinition } from './get-integrations.js';
import { handleGetPosts, getPostsToolDefinition } from './get-posts.js';
import { handleGetSelf, getSelfToolDefinition } from './get-self.js';
import { handleLogin, loginToolDefinition } from './login.js';
// Export all tool definitions
export const postizToolDefinitions = [
    createPostToolDefinition,
    getIntegrationsToolDefinition,
    getPostsToolDefinition,
    getSelfToolDefinition,
    loginToolDefinition
];
// Export all tool handlers
export const postizToolHandlers = {
    [createPostToolDefinition.name]: handleCreatePost,
    [getIntegrationsToolDefinition.name]: handleGetIntegrations,
    [getPostsToolDefinition.name]: handleGetPosts,
    [getSelfToolDefinition.name]: handleGetSelf,
    [loginToolDefinition.name]: handleLogin
};
