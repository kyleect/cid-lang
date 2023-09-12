FROM node:16.14.2

WORKDIR /usr/src/cidlang

COPY package*.json ./

RUN npm ci
RUN npm shrinkwrap

COPY . .
RUN npm install -g .

ENTRYPOINT cidrepl