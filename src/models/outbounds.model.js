// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const Sequelize = require("sequelize");
const DataTypes = Sequelize.DataTypes;

module.exports = function(app) {
  const sequelizeClient = app.get("sequelizeClient");
  const outbounds = sequelizeClient.define(
    "outbounds",
    {
      item_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      order_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      staff_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      shelfItem_id: {
        type: DataTypes.INTEGER
      },
      shelf_id: {
        type: DataTypes.INTEGER
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
  outbounds.associate = function(models) {
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
  };

  return outbounds;
};
