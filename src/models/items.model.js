// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const Sequelize = require("sequelize");
const DataTypes = Sequelize.DataTypes;

module.exports = function(app) {
  const sequelizeClient = app.get("sequelizeClient");
  const items = sequelizeClient.define(
    "items",
    {
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      scanResults: {
        type: DataTypes.STRING,
        allowNull: false
      },
      img: {
        type: DataTypes.STRING
      },
      verified_status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      stock_qty: {
        type: DataTypes.INTEGER,
        defaultValue: 0
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
  items.associate = function(models) {
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
  };

  return items;
};
