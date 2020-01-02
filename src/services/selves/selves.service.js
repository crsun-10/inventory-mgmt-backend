// Initializes the `selves` service on path `/selves`
const { Selves } = require("./selves.class");
const createModel = require("../../models/selves.model");
const hooks = require("./selves.hooks");

module.exports = function(app) {
  const options = {
    Model: createModel(app),
    paginate: app.get("paginate"),
    multi: true
  };

  // Initialize our service with any options it requires
  app.use("/selves", new Selves(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service("selves");

  service.hooks(hooks);
};
