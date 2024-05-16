FROM searxng/searxng:2024.5.10-901819359

RUN apk add --update --no-cache \
  nodejs \
  npm \
  git

ARG SEARXNG_SETTINGS_FOLDER=/etc/searxng

RUN sed -i 's/- html/- json/' /usr/local/searxng/searx/settings.yml \
  && sed -i 's/su-exec searxng:searxng //' /usr/local/searxng/dockerfiles/docker-entrypoint.sh \
  && mkdir -p ${SEARXNG_SETTINGS_FOLDER} \
  && chmod 777 ${SEARXNG_SETTINGS_FOLDER}

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

# Create directory for SSL certificate and key
RUN mkdir -p /app/ssl

# Install Certbot
RUN apk add --no-cache certbot

# Copy Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose HTTP and HTTPS port
EXPOSE 80
EXPOSE 443

CMD ["/usr/local/searxng/dockerfiles/docker-entrypoint.sh -f & touch /etc/searxng/limiter.toml & npm start -- --host"]