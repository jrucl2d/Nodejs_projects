module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    // id는 자동으로 기본 키로 연결해준다.
    "user",
    {
      name: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
      },
      age: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        unique: true,
      },
      married: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      comment: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      timestamps: false, // 테이블 옵션. 이것이 true이면 createdAt과 updatedAt컬럼을 추가한다. 하지만 이미 created_at을 만들었으므로 필요 없다.
    }
  );
};
