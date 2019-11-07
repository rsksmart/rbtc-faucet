const withCSS = require('@zeit/next-css');
const withImages = require('next-images');
const withSass = require('@zeit/next-sass')


module.exports = withSass(withCSS(withImages()));
