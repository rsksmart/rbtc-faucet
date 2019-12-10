FROM node:10
RUN mkdir -p /usr/app
WORKDIR /usr/app
COPY . /usr/app
RUN \ 
    yarn && \
    yarn build
EXPOSE 3000
CMD [ "yarn", "start"]