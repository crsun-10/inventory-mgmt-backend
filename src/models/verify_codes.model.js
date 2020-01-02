// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const Sequelize = require("sequelize");
const DataTypes = Sequelize.DataTypes;

module.exports = function(app) {
  const sequelizeClient = app.get("sequelizeClient");
  const verifyCodes = sequelizeClient.define(
    "verify_codes",
    {
      type: {
        type: DataTypes.STRING,
        allowNull: true
      },
      receiver: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
      },
      verifyCode: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: ""
      },
      expired_time: {
        type: DataTypes.DATE,
        allowNull: true,
        default: new Date()
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
  verifyCodes.associate = function(models) {
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
  };

  return verifyCodes;
};
