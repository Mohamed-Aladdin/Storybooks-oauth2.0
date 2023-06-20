const express = require("express");
const passport = require("passport");
const router = express.Router();

// @description Auth with Goggle
// @route GET /auth/google
router.get("/google", passport.authenticate("google", { scope: ["profile"] }));

// @description Google Auth Callback
// @route GET /auth/google/callback
router.get(
  "/google/callback", passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/dashboard");
  }
  );

// @description Logout User
// @route GET /auth/logout
router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }

    res.redirect("/");
  });
});

module.exports = router;