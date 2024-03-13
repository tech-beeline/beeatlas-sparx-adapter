FROM harbor.vimpelcom.ru/dockerhub/library/node@sha256:d016f19a31ac259d78dc870b4c78132cf9e52e89339ff319bdd9999912818f4a
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm config set registry https://nexus.vimpelcom.ru/repository/proxy__npm__central/
RUN npm config set @beeline:registry https://nexus.vimpelcom.ru/repository/npm-internal/
RUN npm config set strict-ssl false
RUN npm update

RUN npm install --omit=dev && mv node_modules ../
COPY . .
EXPOSE 8080

CMD ["node", "src/app.mjs"]
