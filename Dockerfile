FROM node:lts-alpine3.22

WORKDIR /usr/src/app/src/client
COPY ./src/client/package.json  /usr/src/app/src/client
#COPY ./src/client/package-lock.json  /usr/src/app/src/client

COPY ./src/client/src /usr/src/app/src/client/src
COPY ./src/client/public /usr/src/app/src/client/public

RUN npm install && \
    npm run build && \
    rm -r node_modules && \
    rm -rf /var/cache/apk/* && \
    rm -fr /tmp/* && \
    rm -fr /root/.cache/pip* && \
    npm cache clean --force

#build express 

WORKDIR /usr/src/app
COPY package.json /usr/src/app
COPY package-lock.json /usr/src/app
RUN npm remove node_modules && npm cache clean --force && npm install --omit=dev && mv node_modules ../ && \
    rm -fr /tmp/* && \
    npm cache clean --force

COPY . .

EXPOSE 8080

CMD ["node", "src/app.mjs"]
