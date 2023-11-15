FROM harbor.vimpelcom.ru/dockerhub/library/node@sha256:ff1cc606248f653e55917e4f3ba761be97b5f686923d29166500a120281a4ec4
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install --production --silent && mv node_modules ../
COPY . .
EXPOSE 3000

CMD ["node", "app.mjs"]
