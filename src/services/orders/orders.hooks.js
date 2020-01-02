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
    // find: context =>
    //   populate({
    //     schema: {
    //       include: [
    //         {
    //           service: "outbounds",
    //           nameAs: "outbounds",
    //           parentField: "id",
    //           childField: "order_id"
    //         }
    //       ]
    //     }
    //   })(context),
    find: [
      async context => {
        let result;
        if (context.params.paginate === false) {
          result = context.result;
        } else {
          result = context.result.data;
        }
        // let result = context.result;
        for (let index = 0; index < result.length; index++) {
          let order = result[index];
          try {
            const outbound = await context.app
              .service("outbounds")
              .find({ query: { order_id: order.id } });
            order.outbounds = outbound.data;
          } catch (error) {
            console.log("outbound find error:", error);
          }
        }
        return context;
      }
    ],
    get: [],
    create: [
      async context => {
        const result = context.result;
        const order_patch = await context.app
          .service("orders")
          .patch(result.id, {
            scanResults: result.id + "_" + result.scanResults
          });
        // result = order_patch;
        context.result = order_patch;
        return context;
      }
    ],
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
