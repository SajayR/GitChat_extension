module.exports = function override(config, env) {
  // Do stuff with the webpack config...
  config.devServer = {
    ...config.devServer,
    disableHostCheck: true,
  };
  return config;
};
