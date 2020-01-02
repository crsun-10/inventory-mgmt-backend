const { authenticate } = require("@feathersjs/authentication").hooks;

module.exports = {
  before: {
    all: [authenticate("jwt")],
    find: [],
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
        let result = context.result;
        for (let index = 0; index < result.data.length; index++) {
          let outbound = result.data[index];
          // const shelf_item = await context.app
          //   .service("self-items")
          //   .find({ query: { id: outbound.shelfItem_id } });
          // outbound.shelfItem = shelf_item;
          const item = await context.app
            .service("items")
            .find({ query: { id: outbound.item_id } });
          outbound.items = item;
          const shelf = await context.app
            .service("selves")
            .find({ query: { id: outbound.shelf_id } });
          outbound.shelfData = shelf.data[0];
        }
        return context;
      }
    ],
    get: [],
    create: [
      async context => {
        const result = context.result;
        // result.forEach(async outboundItem => {
        //   const selfitem = await context.app
        //     .service("self-items")
        //     .get(outboundItem.shelfItem_id);
        //   let updateQty = selfitem.after_order_qty - outboundItem.qty;
        //   await context.app
        //     .service("self-items")
        //     .patch(outboundItem.shelfItem_id, {
        //       after_order_qty: updateQty
        //     });

        //   const item = await context.app
        //     .service("items")
        //     .get(outboundItem.item_id);
        //   let updateItemQty = item.stock_qty - outboundItem.qty;
        //   await context.app.service("items").patch(outboundItem.item_id, {
        //     stock_qty: updateItemQty
        //   });
        // });
        for (let index = 0; index < result.length; index++) {
          const outboundItem = result[index];
          const selfitem = await context.app
            .service("self-items")
            .get(outboundItem.shelfItem_id);
          let updateQty = selfitem.after_order_qty - outboundItem.qty;
          await context.app
            .service("self-items")
            .patch(outboundItem.shelfItem_id, {
              after_order_qty: updateQty
            });

          const item = await context.app
            .service("items")
            .get(outboundItem.item_id);
          let updateItemQty = item.stock_qty - outboundItem.qty;
          await context.app.service("items").patch(outboundItem.item_id, {
            stock_qty: updateItemQty
          });
        }
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
