FROM searxng/searxng:2024.5.10-901819359

ENV PORT ${PORT:-7860}

EXPOSE ${PORT}

RUN apk add --update --no-cache \
  nodejs \
  npm \
  git

ARG SEARXNG_SETTINGS_FOLDER=/etc/searxng
RUN sed -i 's/- html/- json/' /usr/local/searxng/searx/settings.yml \
  && sed -i 's/su-exec searxng:searxng //' /usr/local/searxng/dockerfiles/docker-entrypoint.sh \
  && mkdir -p ${SEARXNG_SETTINGS_FOLDER}  \
  && chmod 777 ${SEARXNG_SETTINGS_FOLDER}

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

ENTRYPOINT ["/bin/sh", "-c"]

CMD ["/usr/local/searxng/dockerfiles/docker-entrypoint.sh -f & npm start -- --host"]
