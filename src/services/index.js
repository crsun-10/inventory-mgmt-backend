const users = require("./users/users.service.js");
const inbounds = require("./inbounds/inbounds.service.js");
const items = require("./items/items.service.js");
const orders = require("./orders/orders.service.js");
const outbounds = require("./outbounds/outbounds.service.js");
const selfItems = require("./self_items/self_items.service.js");
const selves = require("./selves/selves.service.js");
const verifyCodes = require("./verify_codes/verify_codes.service.js");
// eslint-disable-next-line no-unused-vars
module.exports = function(app) {
  app.configure(users);
  app.configure(inbounds);
  app.configure(items);
  app.configure(orders);
  app.configure(outbounds);
  app.configure(selfItems);
  app.configure(selves);
  app.configure(verifyCodes);
};
