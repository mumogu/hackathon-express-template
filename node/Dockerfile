FROM node

RUN mkdir /src

RUN npm install express -g
RUN npm install -g nodemon
RUN npm install -s express-handlebars

WORKDIR /src
COPY package.json /src/package.json
RUN npm install

EXPOSE 3000

CMD node bin/www