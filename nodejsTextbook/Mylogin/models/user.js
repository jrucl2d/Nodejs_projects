module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "user",
    {
      name: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: false,
      },
      email: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
      },
      pw: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
    },
    {
      timestamps: true,
      paranoid: true,
    }
  );
};
