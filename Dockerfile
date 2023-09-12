FROM node:16.14.2-alpine as builder

WORKDIR /usr/src/cidlang
COPY package*.json ./
RUN npm ci --production
RUN rm -rf node_modules

FROM builder as installer

RUN npm shrinkwrap
COPY . .
RUN npm install -g .

FROM installer as repl

CMD /bin/sh --login