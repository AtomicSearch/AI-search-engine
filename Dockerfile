# Use the latest SearXNG image as the base
FROM searxng/searxng:latest

# Install necessary dependencies
RUN apk add --no-cache \
  nodejs \
  npm \
  git

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install Node.js dependencies
RUN npm ci

# Copy the application code
COPY . .

# Build the application
RUN npm run build

# Create directory for SSL certificate and key
RUN mkdir -p /app/ssl

# Install Certbot (if required)
RUN apk add --no-cache certbot

# Expose HTTP and HTTPS ports
EXPOSE 80
EXPOSE 443

# Set the entrypoint command
CMD ["/sbin/tini", "--", "/usr/local/searxng/dockerfiles/docker-entrypoint.sh"]
