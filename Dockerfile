FROM docker.io/node:23-slim

# Set working directory
WORKDIR /app

# Add metadata labels
LABEL maintainer="Oculair Media"
LABEL description="Postiz MCP Server with SSE transport"
LABEL version="1.0.0"

# Copy package files and install dependencies
COPY everything/package*.json ./
RUN npm install
RUN npm install dotenv

# Copy source code
COPY everything/src ./src
COPY everything/index.js ./

# Install curl for healthcheck
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Create a non-root user and switch to it
RUN groupadd -r bookstack && useradd -r -g bookstack bookstack
RUN chown -R bookstack:bookstack /app
USER bookstack

# Expose the port
EXPOSE 3084

# Default environment variables (can be overridden at build or runtime)
ARG PORT=3084
ARG NODE_ENV=production
ARG TRANSPORT=http
ARG POSTIZ_API_URL=https://postiz.oculair.ca/api
ARG POSTIZ_API_KEY=

ENV PORT=${PORT}
ENV NODE_ENV=${NODE_ENV}
ENV TRANSPORT=${TRANSPORT}
ENV POSTIZ_API_URL=${POSTIZ_API_URL}
ENV POSTIZ_API_KEY=${POSTIZ_API_KEY}

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:${PORT}/health || exit 1

# Run the server
CMD ["sh", "-c", "node ./src/index.js --${TRANSPORT}"]
