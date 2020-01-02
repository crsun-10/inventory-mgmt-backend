const { authenticate } = require("@feathersjs/authentication").hooks;

module.exports = {
  before: {
    all: [authenticate("jwt")],
    find: [
      async context => {
        const { params } = context;
        if (
          params.query &&
          Object.keys(params.query).indexOf("paginate") > -1
        ) {
          params.paginate = !(
            params.query.paginate === "false" || params.query.paginate === false
          );
          delete params.query.paginate;
        }

        let findType = context.params.query.findType;
        context.params.data = { findType: findType };
        delete context.params.query.findType;
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
        // let result = context.result.data;
        let result;
        if (context.params.paginate === false) {
          result = context.result;
        } else {
          result = context.result.data;
        }

        let findType = context.params.data.findType;
        for (let index = 0; index < result.length; index++) {
          let selfItems = result[index];
          const shelf = await context.app
            .service("selves")
            .find({ query: { id: selfItems.shelf_id } });
          selfItems.selves = shelf.data;
          if (findType !== "item-self") {
            const item = await context.app
              .service("items")
              .find({ query: { id: selfItems.item_id } });
            selfItems.items = item.data;
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
