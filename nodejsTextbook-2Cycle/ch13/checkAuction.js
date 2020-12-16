const { Good, Auction, User, sequelize } = require("./models");
const schedule = require("node-schedule");

module.exports = async () => {
  console.log("checkAuction");
  try {
    // 경매 중 경매가 낙찰되었어야 하는데 서버가 종료되어서 낙찰되지 못한 경매들은 낙찰 처리
    const targets = await Good.findAll({
      where: {
        SoldId: null,
      },
    });
    targets.forEach(async (target) => {
      const end = new Date(target.createdAt);
      end.setHours(end.getHours() + target.end);
      if (end < new Date()) {
        // 경매 시간을 지난 경우 : 현재 시간이 낙찰 종료 시간보다 크면 낙찰 처리
        const t = await sequelize.transaction(); // 같은 t이면 같은 트랜잭션

        try {
          const success = await Auction.findOne({
            where: { GoodId: target.id },
            order: [["bid", "DESC"]],
            transaction: t,
          });
          // 낙찰자가 있다면
          if (success) {
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
          } else {
            await Good.update(
              { soldId: target.ownerId }, // 주인을 소유자로 바꿔줌
              { where: { id: target.id }, transaction: t }
            );
          }

          await t.commit();
        } catch (err) {
          await t.rollback();
        }
      } else {
        // 아직 경매 시간이 남은 경우
        schedule.scheduleJob(end, async () => {
          const t = await sequelize.transaction(); // 같은 t이면 같은 트랜잭션

          try {
            const success = await Auction.findOne({
              where: { GoodId: target.id },
              order: [["bid", "DESC"]],
              transaction: t,
            });
            // 낙찰자가 있다면
            if (success) {
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
            } else {
              // 낙찰자가 없다면
              await Good.update(
                { soldId: target.ownerId }, // 주인을 소유자로 바꿔줌
                { where: { id: target.id }, transaction: t }
              );
            }
            await t.commit();
          } catch (err) {
            await t.rollback();
          }
        });
      }
    });
  } catch (error) {
    console.error(error);
  }
};
