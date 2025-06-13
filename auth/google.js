
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const getAdminSettings = require("../utils/getAdminSettings");
const User = require("../models/User");

module.exports = async function (passport) {
  const settings = await getAdminSettings();

  if (!settings.gmailClientId || !settings.gmailClientSecret) {
    console.warn("Gmail login is not configured in admin settings.");
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: settings.gmailClientId,
        clientSecret: settings.gmailClientSecret,
        callbackURL: "/api/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails[0].value;

          let user = await User.findOne({ email });

          if (!user) {
            user = new User({
              name: profile.displayName,
              email,
              password: "", // not needed, as login is OAuth-based
            });
            await user.save();
          }

          return done(null, user);
        } catch (err) {
          console.error("Google login error:", err);
          return done(err, null);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
};
