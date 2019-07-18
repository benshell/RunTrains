FROM node:10
RUN npm install -g http-server
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
ARG REACT_APP_SERVER_HOST
ARG REACT_APP_SERVER_PORT
ARG REACT_APP_SERVER_SSL
RUN echo "Env var for host: $REACT_APP_SERVER_HOST"
CMD ["npm", "run", "docker"] 
