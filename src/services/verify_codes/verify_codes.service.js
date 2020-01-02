// Initializes the `verify_codes` service on path `/verify_codes`
const { VerifyCodes } = require("./verify_codes.class");
const createModel = require("../../models/verify_codes.model");
const hooks = require("./verify_codes.hooks");

module.exports = function(app) {
  const options = {
    Model: createModel(app),
    paginate: app.get("paginate"),
    multi: true
  };

  // Initialize our service with any options it requires
  app.use("/verify-codes", new VerifyCodes(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service("verify-codes");

  service.hooks(hooks);
};
