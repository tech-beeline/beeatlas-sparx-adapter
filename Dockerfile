FROM harbor.vimpelcom.ru/dockerhub/library/node@sha256:d016f19a31ac259d78dc870b4c78132cf9e52e89339ff319bdd9999912818f4a
WORKDIR /usr/src/app
#COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm config set registry https://nexus.vimpelcom.ru/repository/proxy__npm__central/
RUN npm config set @beeline:registry https://nexus.vimpelcom.ru/repository/npm-internal/
RUN npm config set strict-ssl false
RUN npm update

COPY package.json /usr/src/app
WORKDIR /usr/src/app/src/client
COPY ./src/client/package.json  /usr/src/app/src/client
RUN npm install

COPY ./src/client/src /usr/src/app/src/client/src
COPY ./src/client/public /usr/src/app/src/client/public

RUN npm run build
RUN rm -r node_modules

WORKDIR /usr/src/app
RUN npm install --omit=dev && mv node_modules ../

COPY . .
EXPOSE 8080

CMD ["node", "src/app.mjs"]
