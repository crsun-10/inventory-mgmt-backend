// Initializes the `self_items` service on path `/self_items`
const { SelfItems } = require("./self_items.class");
const createModel = require("../../models/self_items.model");
const hooks = require("./self_items.hooks");

module.exports = function(app) {
  const options = {
    Model: createModel(app),
    paginate: app.get("paginate"),
    multi: true
  };

  // Initialize our service with any options it requires
  app.use("/self-items", new SelfItems(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service("self-items");

  service.hooks(hooks);
};
