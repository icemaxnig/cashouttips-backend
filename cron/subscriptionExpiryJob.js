const cron = require('node-cron');
const Notification = require("../models/Notification");

function daysBetween(date1, date2) {
  return Math.ceil((date2 - date1) / (1000 * 60 * 60 * 24));
}

function startSubscriptionExpiryJob() {
  cron.schedule("0 2 * * *", async () => {
    try {
      const now = new Date();
      // Expire subscriptions
      const result = await User.updateMany(
        { isSubscribed: true, subscriptionExpires: { $lt: now } },
        { $set: { isSubscribed: false } }
      );
      console.log(`🕒 Subscription expiry job: Set ${result.nModified || result.modifiedCount || 0} users to unsubscribed.`);

      // Notify users 3 days before expiry
      const soon = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
      const expiringUsers = await User.find({
        isSubscribed: true,
        subscriptionExpires: { $gte: now, $lte: soon }
      });
      for (const user of expiringUsers) {
        await Notification.create({
          title: "Subscription Expiry Warning",
          message: `Your subscription will expire in ${daysBetween(now, user.subscriptionExpires)} days. Please renew to avoid interruption.`,
          type: "alert",
          user: user._id
        });
      }

      // Notify users who just expired
      const justExpired = await User.find({
        isSubscribed: false,
        subscriptionExpires: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000), $lt: now }
      });
      for (const user of justExpired) {
        await Notification.create({
          title: "Subscription Expired",
          message: "Your subscription has expired. Please renew to regain access.",
          type: "alert",
          user: user._id
        });
      }
    } catch (error) {
      console.error("❌ Subscription expiry job failed:", error);
    }
  });
}

module.exports = startSubscriptionExpiryJob; 