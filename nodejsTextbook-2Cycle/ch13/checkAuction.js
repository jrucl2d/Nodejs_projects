const { Op } = require("Sequelize");

const { Good, Auction, User, sequelize } = require("./models");
const schedule = require("node-schedule");

module.exports = async () => {
  console.log("checkAuction");
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1); // 어제 시간
    // 24시간 이전에 등록된 경매 중 경매가 낙찰되었어야 하는데 서버가 종료되어서 낙찰되지 못한 경매들은 낙찰 처리
    const targets = await Good.findAll({
      where: {
        SoldId: null,
        createdAt: { [Op.lte]: yesterday },
      },
    });
    targets.forEach(async (target) => {
      const t = await sequelize.transaction(); // 같은 t이면 같은 트랜잭션

      try {
        const success = await Auction.findOne({
          where: { GoodId: target.id },
          order: [["bid", "DESC"]],
          transaction: t,
        });
        await Good.update(
          { SoldId: success.UserId },
          { where: { id: target.id }, transaction: t }
        );

        await User.update(
          {
            money: sequelize.literal(`money - ${success.bid}`),
          },
          {
            where: { id: success.UserId },
            transaction: t,
          }
        );
        await t.commit();
      } catch (err) {
        await t.rollback();
      }
    });

    // 어제 이후에 등록된 경매들, 다시 스케줄링
    const unsold = await Good.findAll({
      where: {
        SoldId: null,
        createdAt: { [Op.gt]: yesterday },
      },
    });
    unsold.forEach(async (target) => {
      const end = new Date(target.createdAt);
      end.setDate(end.getDate() + 1); // 24시간 뒤로 설정
      schedule.scheduleJob(end, async () => {
        const t = await sequelize.transaction(); // 같은 t이면 같은 트랜잭션

        try {
          const success = await Auction.findOne({
            where: { GoodId: target.id },
            order: [["bid", "DESC"]],
            transaction: t,
          });
          await Good.update(
            { SoldId: success.UserId },
            { where: { id: target.id }, transaction: t }
          );

          await User.update(
            {
              money: sequelize.literal(`money - ${success.bid}`),
            },
            {
              where: { id: success.UserId },
              transaction: t,
            }
          );
          await t.commit();
        } catch (err) {
          await t.rollback();
        }
      });
    });
  } catch (error) {
    console.error(error);
  }
};
