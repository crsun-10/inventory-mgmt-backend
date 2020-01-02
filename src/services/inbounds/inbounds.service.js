// Initializes the `inbounds` service on path `/inbounds`
const { Inbounds } = require("./inbounds.class");
const createModel = require("../../models/inbounds.model");
const hooks = require("./inbounds.hooks");

module.exports = function(app) {
  const options = {
    Model: createModel(app),
    paginate: app.get("paginate"),
    multi: true
  };

  // Initialize our service with any options it requires
  app.use("/inbounds", new Inbounds(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service("inbounds");

  service.hooks(hooks);
};
