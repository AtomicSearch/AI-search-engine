# Use the latest SearXNG image as the base
FROM searxng/searxng:latest

# Install necessary dependencies
RUN apk add --no-cache nodejs npm git certbot

ARG SEARXNG_SETTINGS_FOLDER=/etc/searxng
RUN sed -i 's/- html/- json/' /usr/local/searxng/searx/settings.yml \
  && sed -i 's/su-exec searxng:searxng //' /usr/local/searxng/dockerfiles/docker-entrypoint.sh \
  && mkdir -p ${SEARXNG_SETTINGS_FOLDER} \
  && chmod 777 ${SEARXNG_SETTINGS_FOLDER}

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Copy the .npmrc file
COPY ./.npmrc ./.npmrc

# Copy the custom SearXNG settings file
COPY custom-settings.yml ${SEARXNG_SETTINGS_FOLDER}/settings.yml

# Install Node.js dependencies
RUN npm ci

# Copy the application code
COPY . .

# Build the application
RUN npm run build

# Create directory for SSL certificate and key
RUN mkdir -p /app/ssl

# Set higher timeout values for SearXNG
ENV SEARXNG_TIMEOUT_ALL=120
ENV SEARXNG_TIMEOUT_SPECIFIC="soundcloud=120 wikidata=120"

# Expose HTTP and HTTPS ports
ENV PORT ${PORT:-7860}
EXPOSE ${PORT}
EXPOSE 80
EXPOSE 443

# Set the entrypoint command
ENTRYPOINT [ "/bin/sh", "-c" ]
CMD [ "/usr/local/searxng/dockerfiles/docker-entrypoint.sh -f & touch /etc/searxng/limiter.toml & npm start -- --host" ]
