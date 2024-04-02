FROM harbor.vimpelcom.ru/dockerhub/library/node@sha256:d234c1b72dedaa91b896e86d435425e6738a8dd1338ad118ebb0e0dc551f3872
WORKDIR /usr/src/app
#COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm config set registry https://nexus.vimpelcom.ru/repository/proxy__npm__central/
RUN npm config set @beeline:registry https://nexus.vimpelcom.ru/repository/npm-internal/
RUN npm config set strict-ssl false

#build react application
#WORKDIR /usr/src/app/src/client

#COPY ./src/client/package.json  /usr/src/app/src/client
#COPY ./src/client/package-lock.json  /usr/src/app/src/client
#COPY ["package.json",  "./"]

#COPY ./src/client/src /usr/src/app/src/client/src
#COPY ./src/client/public /usr/src/app/src/client/public

#RUN npm install --omit=dev && \
    #npm run build && \
    #rm -r node_modules && \
    #rm -rf /var/cache/apk/* && \
    #rm -fr /tmp/* && \
    #rm -fr /root/.cache/pip* && \
    #npm cache clean --force

#build express 

WORKDIR /usr/src/app
COPY package.json /usr/src/app
RUN npm install --omit=dev && mv node_modules ../ && \
    rm -fr /tmp/* && \
    npm cache clean --force


COPY . .
EXPOSE 8080

CMD ["node", "src/app.mjs"]
