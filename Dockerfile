FROM node:24-alpine@sha256:820e86612c21d0636580206d802a726f2595366e1b867e564cbc652024151e8a
RUN mkdir -p /usr/app
WORKDIR /usr/app
COPY . /usr/app
RUN \ 
    npm i -f && \
    npm run build
EXPOSE 3000
CMD [ "npm", "start"]