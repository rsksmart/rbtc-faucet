FROM node:20-alpine
RUN mkdir -p /usr/app
WORKDIR /usr/app
COPY . /usr/app
RUN \ 
    npm i -f && \
    npm run build
EXPOSE 3000
CMD [ "npm", "start"]