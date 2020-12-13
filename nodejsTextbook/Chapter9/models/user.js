module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "user",
    {
      email: {
        type: DataTypes.STRING(40),
        allowNull: true,
        unique: true,
      },
      nick: {
        type: DataTypes.STRING(15),
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      provider: {
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: "local", // local이면 local 로그인, kako이면 카카오 로그인
      },
      snsId: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
    },
    {
      timestamps: true, // createdAt, updatedAt
      paranoid: true, // deletedAt 설정 됨
    }
  );
};
