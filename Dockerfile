FROM node:23-alpine@sha256:498bf3e45a4132b99952f88129ae5429e3568f3836edbfc09e3661515f620837
RUN mkdir -p /usr/app
WORKDIR /usr/app
COPY . /usr/app
RUN \ 
    npm i -f && \
    npm run build
EXPOSE 3000
CMD [ "npm", "start"]