module.exports = async function checkSubscription(req, res, next) {
  const user = req.user;

  if (
    user.isSubscribed &&
    user.subscriptionExpires &&
    new Date(user.subscriptionExpires) < new Date()
  ) {
    user.isSubscribed = false;
    await user.save();
  }

  next();
};