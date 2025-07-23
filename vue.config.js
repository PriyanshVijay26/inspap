const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  // Combine both settings into one object
  transpileDependencies: true,
  publicPath: ''
});