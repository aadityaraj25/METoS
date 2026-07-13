const express = require("express");
const {
  register,
  login,
  getMe,
  updateProfile,
  toggleDarkMode,
} = require("../../controllers/auth.controllers");
const { protect } = require("../../middlewares/auth.middlewares");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.put("/update", protect, updateProfile);
router.put("/darkmode", protect, toggleDarkMode);

module.exports = router;
