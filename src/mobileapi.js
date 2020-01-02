const authentication = require("./authentication");
module.exports = function(app) {
  app.post("/logout", (req, res) => {
    res.send({
      status: "success"
    });
  });
  app.post("/mobile-api/items/find", async (req, res) => {
    await app
      .service("items")
      .find({
        query: {
          user_id: req.body.user.employerId,
          scanResults: req.body.data.scanResults,
          verified_status: true
        }
      })
      .then(result => {
        res.send({
          status: "success",
          result: result.data
        });
      })
      .catch(error => {
        res.send({
          status: "error",
          result: error
        });
      });
  });

  // const { Op } = require("sequelize");
  // pengdingInvitationId: { [Op.contains]: [6] }

  app.get("/mobile-api/employer/:id", async (req, res) => {
    await app
      .service("users")
      .find({ query: { id: req.params.id } })
      .then(result => {
        delete result.data[0].password;
        res.send({
          status: "success",
          result: result.data[0]
        });
      })
      .catch(error => {
        res.send({
          status: "error",
          result: error
          // statusCode: error.statusCode,
          // statusMessage: error.statusMessage
        });
      });
  });

  app.post("/mobile-api/employer", async (req, res) => {
    await app
      .service("users")
      .patch(
        null,
        {
          employerId: req.body.user.id
        },
        {
          query: { id: req.body.user.id }
        }
      )
      .then(result => {
        delete result.password;
        res.send({
          status: "success",
          result: result
        });
      })
      .catch(error => {
        res.send({
          status: "error",
          result: error
        });
      });
  });

  app.get("/mobile-api/orders", async (req, res) => {
    await app
      .service("orders")
      .find({ query: { user_id: req.query.employerId, paginate: false } })
      .then(result => {
        for (let idx = 0; idx < result.length; idx++) {
          let order_element = result[idx];
          order_element.status = 1;
          for (
            let idx_outbound = 0;
            idx_outbound < order_element.outbounds.length;
            idx_outbound++
          ) {
            const outbound_element = order_element.outbounds[idx_outbound];
            if (outbound_element.staff_id) {
              order_element.status *= 1;
            } else {
              order_element.status = 0;
            }
          }
        }
        for (let index = 0; index < result.length; index++) {
          delete result[index].outbounds;
        }
        let completed_order = result.filter(
          order_obj => order_obj.status === 0
        );
        res.send({
          status: "success",
          result: completed_order
        });
      })
      .catch(error => {
        res.send({
          status: "error",
          result: error
        });
      });
  });

  app.get("/mobile-api/orders/:id", async (req, res) => {
    await app
      .service("outbounds")
      .find({ query: { order_id: req.params.id } })
      .then(result => {
        res.send({
          status: "success",
          result: result.data
        });
      })
      .catch(error => {
        res.send({
          status: "error",
          result: error
        });
      });
  });

  app.post("/mobile-api/orders/:id", async (req, res) => {
    for (let index = 0; index < req.body.data.length; index++) {
      const element_data = req.body.data[index];
      // check outbound is exist
      const outbound_data = await app.service("outbounds").find({
        query: {
          id: element_data.outboundId,
          order_id: req.params.id
        }
      });
      if (outbound_data.total === 0) {
        // check outbound is exist
        res.send({
          status: "error",
          result: "Invalid Request: Couldn't find specific outbound!"
        });
        return;
      }
      if (outbound_data.data[0].staff_id) {
        // already finished outbound
        res.send({
          status: "error",
          result: "Invalid Request: Already finished!"
        });
        return;
      }
      // check staff validation
      const user_data = await app.service("users").get(element_data.staffId);
      const employer_id = user_data.employerId;
      if (!employer_id) {
        res.send({
          status: "error",
          result: "Invalid Request: wrong staff info!"
        });
        return;
      }
      // const shelf_data = await app.service("selves").find({
      //   query: {
      //     user_id: employer_id,
      //     id: element_data.shelfId
      //   }
      // });
      // if (shelf_data.total === 0) {
      //   res.send({
      //     status: "error",
      //     result: "Invalid Request: Couldn't find shelf"
      //   });
      //   return;
      // }
      // // check if shelf item is exist
      // const shelfItem_data = await app.service("self-items").find({
      //   query: {
      //     user_id: employer_id,
      //     item_id: element_data.itemId,
      //     shelf_id: element_data.shelfId
      //   }
      // });
      // if (shelfItem_data.total === 0) {
      //   res.send({
      //     status: "error",
      //     result: "Invalid Request: Couldn't find self item"
      //   });
      //   return;
      // }
      // if (shelfItem_data.data[0].qty < element_data.qty) {
      //   res.send({
      //     status: "error",
      //     result: "Invalid Request: Invalid Qty"
      //   });
      //   return;
      // }
    }

    for (let index = 0; index < req.body.data.length; index++) {
      const element_data = req.body.data[index];
      const user_data = await app.service("users").get(element_data.staffId);
      const employer_id = user_data.employerId;
      const outbound_data = await app.service("outbounds").find({
        query: {
          id: element_data.outboundId,
          order_id: req.params.id
        }
      });
      const shelfItem_data = await app.service("self-items").find({
        query: {
          item_id: outbound_data.data[0].item_id,
          shelf_id: outbound_data.data[0].shelf_id,
          user_id: employer_id
        }
      });
      let update_qty = shelfItem_data.data[0].qty;
      update_qty -= outbound_data.data[0].qty;
      const shelfItem_id = shelfItem_data.data[0].id;
      await app.service("self-items").patch(shelfItem_id, { qty: update_qty });

      await app.service("outbounds").patch(
        null,
        {
          staff_id: element_data.staffId
        },
        {
          query: {
            id: element_data.outboundId
          }
        }
      );
    }
    res.send({
      status: "success",
      result: "success"
    });
  });

  // app.post("/mobile-api/inbound", async (req, res) => {
  //   let create_data = {
  //     qty: req.body.data.qty,
  //     staff_id: req.body.data.staffId,
  //     employerId: req.body.data.employerId,
  //     itemScanResults: req.body.data.itemScanResults.text,
  //     shelfScanResults: req.body.data.shelfScanResults.text
  //   };

  //   if (create_data.qty <= 0) {
  //     res.send({
  //       status: "error",
  //       result: "Invalid Request: Not allowed to input negative qty"
  //     });
  //     return;
  //   }

  //   let isNewShelf = false;
  //   const shelf = await app
  //     .service("selves")
  //     .find({ query: { scanResults: create_data.shelfScanResults } });

  //   if (shelf.data.length) {
  //     if (shelf.data[0].user_id === create_data.employerId) {
  //       create_data.shelf_id = shelf.data[0].id;
  //     } else {
  //       res.send({
  //         status: "error",
  //         result: "Another employer's shelf"
  //       });
  //       return;
  //     }
  //   } else {
  //     // no shelf
  //     const new_shelf = await app.service("selves").create({
  //       user_id: create_data.employerId,
  //       name: create_data.shelfScanResults,
  //       scanResults: create_data.shelfScanResults
  //     });
  //     create_data.shelf_id = new_shelf.id;
  //     isNewShelf = true;
  //   }

  //   let update_stock_qty = 0;
  //   const items_data = await app
  //     .service("items")
  //     .find({ query: { scanResults: create_data.itemScanResults } });

  //   const filtered_item = items_data.data.filter(
  //     itemObj => itemObj.user_id === create_data.employerId
  //   );

  //   if (filtered_item.length) {
  //     update_stock_qty = filtered_item[0].stock_qty;
  //     create_data.item_id = filtered_item[0].id;
  //   } else {
  //     const new_item = await app.service("items").create({
  //       user_id: create_data.employerId,
  //       name: create_data.itemScanResults,
  //       scanResults: create_data.itemScanResults
  //     });
  //     create_data.item_id = new_item.id;
  //   }

  //   console.log(">>>>>>>>>>>>>>> create data:", create_data);

  //   const self_item_data = await app.service("self-items").find({
  //     query: {
  //       item_id: create_data.item_id,
  //       shelf_id: create_data.shelf_id,
  //       user_id: create_data.employerId
  //     }
  //   });

  //   if (self_item_data.data.length) {
  //     let update_qty = self_item_data.data[0].qty + create_data.qty;
  //     app
  //       .service("self-items")
  //       .patch(self_item_data.data[0].id, { qty: update_qty });
  //   } else {
  //     const new_selfItem = app.service("self-items").create({
  //       item_id: create_data.item_id,
  //       shelf_id: create_data.shelf_id,
  //       user_id: create_data.employerId,
  //       qty: create_data.qty
  //     });
  //   }

  //   /////////////////////////////////////////////////////////////////////////////
  //   update_stock_qty += create_data.qty;
  //   app
  //     .service("items")
  //     .patch(create_data.item_id, { stock_qty: update_stock_qty });
  //   //////////////////////////////////////////////////////////////////////////////
  //   const new_inbound = await app.service("inbounds").create(create_data);
  //   console.log(">>>>>>>>>>>>>>>>>>> new inbound: ", new_inbound);
  //   res.send({
  //     status: "success",
  //     result: new_inbound
  //   });
  //   // .then(result => {
  //   //   res.send({
  //   //     status: "success",
  //   //     result: result.data
  //   //   });
  //   // })
  //   // .catch(error => {
  //   //   res.send({
  //   //     status: "error",
  //   //     result: error
  //   //   });
  //   // });
  // });
  app.post("/mobile-api/inbound", async (req, res) => {
    for (let index = 0; index < req.body.data.length; index++) {
      const element_data = req.body.data[index];
      // check qty validation
      if (element_data.qty <= 0) {
        res.send({
          status: "error",
          result: "Invalid Request: Not allowed to input negative or empty qty"
        });
        return;
      }
      // check shelf validation
      const shelf = await app
        .service("selves")
        .find({ query: { scanResults: element_data.shelfScanResults.text } });

      if (shelf.data.length) {
        if (shelf.data[0].user_id !== element_data.employerId) {
          res.send({
            status: "error",
            result: "Another employer's shelf"
          });
          return;
        }
      }
      // check employerId is correct
      if (!element_data.staffId) {
        res.send({
          status: "error",
          result: "Invalid request. None staffId"
        });
        return;
      }
      if (!element_data.employerId) {
        res.send({
          status: "error",
          result: "Invalid request. None employerId"
        });
        return;
      }
      const user_data = await app.service("users").get(element_data.staffId);
      if (user_data.employerId !== element_data.employerId) {
        res.send({
          status: "error",
          result: "Invalid request. EmployerId is not staff's real employerId"
        });
        return;
      }
    }

    for (let index = 0; index < req.body.data.length; index++) {
      const element_data = req.body.data[index];

      let create_data = {
        qty: element_data.qty,
        staff_id: element_data.staffId,
        employerId: element_data.employerId,
        itemScanResults: element_data.itemScanResults.text,
        shelfScanResults: element_data.shelfScanResults.text,
        img: element_data.message
      };

      let isNewShelf = false;
      const shelf = await app
        .service("selves")
        .find({ query: { scanResults: create_data.shelfScanResults } });

      if (shelf.data.length) {
        if (shelf.data[0].user_id === create_data.employerId) {
          create_data.shelf_id = shelf.data[0].id;
        } else {
          res.send({
            status: "error",
            result: "Another employer's shelf"
          });
          return;
        }
      } else {
        // no shelf
        const new_shelf = await app.service("selves").create({
          user_id: create_data.employerId,
          name: create_data.shelfScanResults,
          scanResults: create_data.shelfScanResults
        });
        create_data.shelf_id = new_shelf.id;
        isNewShelf = true;
      }

      let update_stock_qty = 0;
      const items_data = await app
        .service("items")
        .find({ query: { scanResults: create_data.itemScanResults } });

      const filtered_item = items_data.data.filter(
        itemObj => itemObj.user_id === create_data.employerId
      );

      if (filtered_item.length) {
        update_stock_qty = filtered_item[0].stock_qty;
        create_data.item_id = filtered_item[0].id;
      } else {
        const user_data = await app.service("users").get(element_data.staffId);
        const new_item = await app.service("items").create({
          user_id: create_data.employerId,
          name: create_data.itemScanResults,
          scanResults: create_data.itemScanResults,
          img: user_data.name + "_" + create_data.img
        });
        create_data.item_id = new_item.id;
      }

      console.log(">>>>>>>>>>>>>>> create data:", create_data);

      const self_item_data = await app.service("self-items").find({
        query: {
          item_id: create_data.item_id,
          shelf_id: create_data.shelf_id,
          user_id: create_data.employerId
        }
      });

      if (self_item_data.data.length) {
        let update_qty = self_item_data.data[0].qty + create_data.qty;
        let update_after_order_qty =
          self_item_data.data[0].after_order_qty + create_data.qty;
        app.service("self-items").patch(self_item_data.data[0].id, {
          qty: update_qty,
          after_order_qty: update_after_order_qty
        });
      } else {
        const new_selfItem = app.service("self-items").create({
          item_id: create_data.item_id,
          shelf_id: create_data.shelf_id,
          user_id: create_data.employerId,
          qty: create_data.qty,
          after_order_qty: create_data.qty
        });
      }

      /////////////////////////////////////////////////////////////////////////////
      update_stock_qty += create_data.qty;
      app
        .service("items")
        .patch(create_data.item_id, { stock_qty: update_stock_qty });
      //////////////////////////////////////////////////////////////////////////////
      const new_inbound = await app.service("inbounds").create(create_data);
      console.log(">>>>>>>>>>>>>>>>>>> new inbound: ", new_inbound);
      // res.send({
      //   status: "success",
      //   result: new_inbound
      // });
    }
    res.send({
      status: "success",
      result: "success"
    });
  });
};
