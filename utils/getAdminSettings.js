const AdminSettings = require("../models/AdminSettings");

const getAdminSettings = async () => {
  const settings = await AdminSettings.findOne();
  return settings || {};
};

module.exports = getAdminSettings;
