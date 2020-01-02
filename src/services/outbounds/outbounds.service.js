// Initializes the `outbounds` service on path `/outbounds`
const { Outbounds } = require("./outbounds.class");
const createModel = require("../../models/outbounds.model");
const hooks = require("./outbounds.hooks");

module.exports = function(app) {
  const options = {
    Model: createModel(app),
    paginate: app.get("paginate"),
    multi: true
  };

  // Initialize our service with any options it requires
  app.use("/outbounds", new Outbounds(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service("outbounds");

  service.hooks(hooks);
};
