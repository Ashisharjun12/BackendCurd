FROM node:latest

COPY . /backendcurd

WORKDIR /backendcurd/

RUN npm install

EXPOSE 3000

CMD [ "node", "app" ]