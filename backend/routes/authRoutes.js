const express = require("express");
const { register, login } = require("../controllers/authController");
const User = require("../models/User");

const auth = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.get("/me", auth, async (req, res, next) => {
  try {
    const includeTasks = req.query.includeTasks === "true";
    const query = User.findById(req.user).select("-password");

    if (includeTasks) {
      query.populate("tasks");
    }

    const user = await query;
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
