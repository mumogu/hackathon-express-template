FROM node

RUN mkdir /src

RUN npm install express -g
RUN npm install -g nodemon
RUN npm install -s express-handlebars

COPY . /src/
#COPY package.json /src/package.json
WORKDIR /src
RUN npm install

EXPOSE 3000

CMD node bin/www