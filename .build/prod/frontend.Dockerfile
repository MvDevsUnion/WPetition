# Build stage - compile the React/Vite app
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first for better caching
COPY frontend-react/package*.json ./

# Install dependencies
RUN npm ci

# Copy source files
COPY frontend-react/ ./

# Build the production bundle
RUN npm run build

# Production stage - serve with Nginx
FROM nginx:alpine

# Copy custom nginx configuration
COPY .build/prod/nginx.conf /etc/nginx/nginx.conf

# Copy built React app from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html/

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
