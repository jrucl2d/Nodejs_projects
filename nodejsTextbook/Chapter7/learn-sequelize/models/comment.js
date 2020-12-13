<<<<<<< HEAD
module.exports = (sequelize, dataTypes) => {
=======
module.exports = (sequelize, DataTypes) => {
>>>>>>> ef917fcc8250683fb139ad14a21c642bac3ac1c4
  return sequelize.define(
    "comment",
    {
      comment: {
<<<<<<< HEAD
        type: dataTypes.STRING(100),
        allowNull: false,
      },
      created_at: {
        type: dataTypes.DATE,
        allowNull: true,
        defaultValue: dataTypes.NOW,
=======
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
>>>>>>> ef917fcc8250683fb139ad14a21c642bac3ac1c4
      },
    },
    {
      timestamps: false,
    }
  );
};
<<<<<<< HEAD
// 관계는 따로 정의한다.
=======
// commenter 컬럼같은 관계는 따로 index.js 파일에 명시해준다.
>>>>>>> ef917fcc8250683fb139ad14a21c642bac3ac1c4
