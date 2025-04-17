FROM node:23-alpine@sha256:86703151a18fcd06258e013073508c4afea8e19cd7ed451554221dd00aea83fc
RUN mkdir -p /usr/app
WORKDIR /usr/app
COPY . /usr/app
RUN \ 
    npm i -f && \
    npm run build
EXPOSE 3000
CMD [ "npm", "start"]