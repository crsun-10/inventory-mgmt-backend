// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const Sequelize = require("sequelize");
const DataTypes = Sequelize.DataTypes;

module.exports = function(app) {
  const sequelizeClient = app.get("sequelizeClient");
  const selfItems = sequelizeClient.define(
    "self_items",
    {
      item_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      shelf_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      after_order_qty: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      qty: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    },
    {
      hooks: {
        beforeCount(options) {
          options.raw = true;
        }
      }
    }
  );

  // eslint-disable-next-line no-unused-vars
  selfItems.associate = function(models) {
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
  };

  return selfItems;
};
