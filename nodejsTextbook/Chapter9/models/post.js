module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "post",
    {
      content: {
        type: DataTypes.STRING(140),
        allowNull: false,
      },
      img: {
        type: DataTypes.STRING(200), // 이미지 경로 저장
        allowNull: false,
      },
    },
    {
      timestamps: true,
      paranoid: true,
    }
  );
};
