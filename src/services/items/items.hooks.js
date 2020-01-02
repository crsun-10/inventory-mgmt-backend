const { authenticate } = require("@feathersjs/authentication").hooks;

module.exports = {
  before: {
    all: [authenticate("jwt")],
    find: [
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

          let findType = context.params.query.findType;
          context.params.data = { findType: findType };
          delete context.params.query.findType;
        } catch (error) {
          console.error("item service find error:", error);
        }
        return context;
      }
    ],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [
      async context => {
        let findType = context.params.data.findType;
        let result;
        if (context.params.paginate === false) {
          result = context.result;
        } else {
          result = context.result.data;
        }
        if (findType === "item-self") {
          for (let index = 0; index < result.length; index++) {
            const item = result[index];
            const selfItems = await context.app
              .service("self-items")
              .find({ query: { item_id: item.id, findType: "item-self" } });
            item.selfItems = selfItems;
          }
        }
        return context;
      }
    ],
    get: [],
    create: [],
    update: [],
    patch: [],
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
