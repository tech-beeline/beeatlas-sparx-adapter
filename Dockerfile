FROM harbor.vimpelcom.ru/dockerhub/library/node@sha256:0952d404a44c0c1f10423b7f9a7a373427a2fca5704afe2d46fe152524b8a403
WORKDIR /usr/src/app
#COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm config set registry https://nexus.vimpelcom.ru/repository/npm-all/
#RUN npm config set @beeline:registry https://nexus.vimpelcom.ru/repository/npm-all/
RUN npm config set strict-ssl false

#build react application
#WORKDIR /usr/src/app/src/client

#COPY ./src/client/package.json  /usr/src/app/src/client
#COPY ./src/client/package-lock.json  /usr/src/app/src/client
#COPY ["package.json",  "./"]
# [ ] Поменять, когда react build починится
# RUN npm --version
# RUN node --version
# COPY ./src/client/deploy /usr/src/app/src/client/build
WORKDIR /usr/src/app/src/client
COPY ./src/client/package.json  /usr/src/app/src/client
COPY ./src/client/package-lock.json  /usr/src/app/src/client

COPY ./src/client/src /usr/src/app/src/client/src
COPY ./src/client/public /usr/src/app/src/client/public

RUN npm ci --omit=dev && \
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
ENV NODE_EXTRA_CA_CERTS=./ca/cert.pem
EXPOSE 8080

CMD ["node", "src/app.mjs"]
