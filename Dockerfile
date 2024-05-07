FROM searxng/searxng:2024.4.29-e45a7cc06

ENV PORT ${PORT:-7860}

EXPOSE ${PORT}

RUN apk add --update --no-cache \
  nodejs \
  npm \
  git

RUN sed -i 's/- html/- json/' /usr/local/searxng/searx/settings.yml \
  && sed -i 's/su-exec searxng:searxng //' /usr/local/searxng/dockerfiles/docker-entrypoint.sh \
  && mkdir -p /etc/searxng \
  && chmod 777 /etc/searxng

WORKDIR /app

COPY package*.json ./

RUN npm ci || npm install --legacy-peer-deps

COPY . .

RUN npm run build

ENTRYPOINT ["/bin/sh", "-c"]

CMD ["/usr/local/searxng/dockerfiles/docker-entrypoint.sh -f & npm start -- --host"]
