const { authenticate } = require("@feathersjs/authentication").hooks;

const {
  hashPassword,
  protect
} = require("@feathersjs/authentication-local").hooks;

const sendInvitationToNewstaff = require("../../hooks/send-invitation-to-newstaff");

module.exports = {
  before: {
    all: [],
    find: [
      authenticate("jwt"),
      async context => {
        try {
          const { params } = context;
          if (
            params.query &&
            Object.keys(params.query).indexOf("paginate") > -1
          ) {
            params.paginate = !(
              params.query.paginate === "false" ||
              params.query.paginate === false
            );
            delete params.query.paginate;
          }
        } catch (error) {
          console.error("user service find error:", error);
        }
        return context;
      }
    ],
    get: [authenticate("jwt")],
    create: [hashPassword("password")],
    update: [hashPassword("password"), authenticate("jwt")],
    patch: [hashPassword("password"), authenticate("jwt")],
    remove: [authenticate("jwt")]
  },

  after: {
    all: [
      // Make sure the password field is never sent to the client
      // Always must be the last hook
      protect("password")
    ],
    find: [],
    get: [],
    create: [
      async context => {
        try {
          const result = context.result;
          await context.app
            .service("users")
            .patch(
              null,
              { employerId: result.id },
              { query: { email: result.email } }
            );
          result.employerId = result.id;
        } catch (error) {
          console.error(
            ">>>>>>>>>>>>>>> user create ---------- patch error:",
            error
          );
        }
        return context;
      }
    ],
    update: [],
    patch: [sendInvitationToNewstaff()],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
