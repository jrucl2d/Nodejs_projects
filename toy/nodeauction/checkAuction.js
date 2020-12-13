const schedule = require("node-schedule");
const { Good, Auction, User, sequelize } = require("./models");

module.exports = async () => {
  console.log("checkAuction");
  try {
    const targets = await Good.findAll({ where: { SoldId: null } });
    targets.forEach(async (target) => {
      const end = new Date(target.createdAt);
      end.setHours(end.getHours() + target.end);
      if (end < new Date()) {
        // 현재 시간이 낙찰 종료 시간보다 크면
        const success = await Auction.findOne({
          where: { GoodId: target.id },
          order: [["bid", "DESC"]],
        });
        if (success) {
          await Good.update(
            { SoldId: success.UserId },
            { where: { id: target.id } }
          );
          await User.update(
            {
              money: sequelize.literal(`money - ${success.bid}`),
            },
            {
              where: { id: success.UserId },
            }
          );
        } else {
          await Good.update(
            { soldId: target.ownerId }, // 주인을 소유자로 바꿔줌
            { where: { id: target.id } }
          );
        }
      } else {
        // 낙찰 종료된 것들(경매 진행중인 것들)이 아니면 스케쥴러 다시 등록
        schedule.scheduleJob(end, async () => {
          const success = await Auction.findOne({
            where: { goodId: target.id },
            order: [["bid", "DESC"]],
          }); // success가 비어있다면 아무도 입찰을 안 했다는 뜻
          if (success) {
            // 낙찰자가 있다면
            await Good.update(
              { soldId: success.userId },
              { where: { id: target.id } }
            );
            await User.update(
              { money: sequelize.literal(`money - ${success.bid}`) },
              {
                where: { id: success.userId },
              }
            );
          } else {
            // 낙찰자가 없다면
            await Good.update(
              { soldId: target.ownerId }, // 주인을 소유자로 바꿔줌
              { where: { id: target.id } }
            );
          }
        });
      }
    });
  } catch (error) {
    console.error(error);
  }
};
